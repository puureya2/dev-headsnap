import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { createAdminClient } from "@/lib/supabase/server";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const { generationId, userId } = await request.json();

    if (!generationId || !userId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get generation record
    const { data: generation, error: genError } = await supabase
      .from("generations")
      .select("*")
      .eq("id", generationId)
      .eq("user_id", userId)
      .single();

    if (genError || !generation) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 });
    }

    if (generation.status !== "paid") {
      return NextResponse.json({ error: "Generation not paid" }, { status: 402 });
    }

    // Update to processing
    await supabase
      .from("generations")
      .update({ status: "processing" })
      .eq("id", generationId);

    // List uploaded files
    const { data: files, error: listError } = await supabase.storage
      .from("uploads")
      .list(`${userId}/${generationId}`);

    if (listError || !files || files.length === 0) {
      await supabase
        .from("generations")
        .update({ status: "failed", error_message: "No uploaded files found" })
        .eq("id", generationId);
      return NextResponse.json({ error: "No uploaded files" }, { status: 400 });
    }

    // Get signed URLs for uploaded photos
    const filePaths = files
      .filter((f) => !f.name.startsWith("."))
      .map((f) => `${userId}/${generationId}/${f.name}`);

    const { data: signedUrls, error: urlError } = await supabase.storage
      .from("uploads")
      .createSignedUrls(filePaths, 3600);

    if (urlError || !signedUrls) {
      await supabase
        .from("generations")
        .update({ status: "failed", error_message: "Failed to get file URLs" })
        .eq("id", generationId);
      return NextResponse.json({ error: "Failed to get file URLs" }, { status: 500 });
    }

    const inputImageUrls = signedUrls.map((su) => su.signedUrl);

    // Use FLUX.1 schnell or a face model via Replicate
    // Using flux-dev-lora or similar face fine-tuning
    const prediction = await replicate.predictions.create({
      model: "ostris/flux-dev-lora-trainer",
      version: "e440909d3512c31646ee2e0c7d6f6f4923224863a6a10c494606e79fb5844497",
      input: {
        input_images: inputImageUrls,
        steps: 1000,
        lora_rank: 16,
        optimizer: "adamw8bit",
        batch_size: 1,
        resolution: "512,768,1024",
        autocaption: true,
        trigger_word: "TOK",
        learning_rate: 0.0004,
      },
    });

    await supabase
      .from("generations")
      .update({ replicate_prediction_id: prediction.id })
      .eq("id", generationId);

    // Poll in background (in production, use a webhook)
    pollAndUpdate(generationId, userId, prediction.id).catch(console.error);

    return NextResponse.json({ predictionId: prediction.id, status: "processing" });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}

async function pollAndUpdate(
  generationId: string,
  userId: string,
  predictionId: string
) {
  const supabase = createAdminClient();
  const maxAttempts = 120; // 20 minutes with 10s intervals
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise((r) => setTimeout(r, 10000));
    attempts++;

    const prediction = await replicate.predictions.get(predictionId);

    if (prediction.status === "failed" || prediction.error) {
      await supabase
        .from("generations")
        .update({
          status: "failed",
          error_message: String(prediction.error ?? "Generation failed"),
        })
        .eq("id", generationId);
      return;
    }

    if (prediction.status === "succeeded" && prediction.output) {
      // The trained model output — now generate 50 headshots
      const trainedVersion = Array.isArray(prediction.output)
        ? prediction.output[0]
        : prediction.output;

      await generateHeadshots(generationId, userId, trainedVersion, supabase);
      return;
    }
  }

  await supabase
    .from("generations")
    .update({ status: "failed", error_message: "Generation timed out" })
    .eq("id", generationId);
}

async function generateHeadshots(
  generationId: string,
  userId: string,
  trainedVersion: string,
  supabase: ReturnType<typeof createAdminClient>
) {
  const prompts = [
    "professional headshot of TOK, business attire, white background, studio lighting",
    "professional headshot of TOK, casual business look, grey background",
    "professional headshot of TOK, corporate style, clean background",
    "headshot of TOK, LinkedIn profile photo, smart casual",
    "portrait of TOK, professional, neutral expression, office background",
  ];

  const resultUrls: string[] = [];

  for (let i = 0; i < 50; i++) {
    const prompt = prompts[i % prompts.length];
    try {
      const output = await replicate.run(trainedVersion as `${string}/${string}:${string}`, {
        input: {
          prompt: prompt + ` variation ${i + 1}`,
          num_outputs: 1,
          guidance_scale: 3.5,
          num_inference_steps: 28,
        },
      });

      if (Array.isArray(output) && output[0]) {
        const imageUrl = output[0] as string;

        // Store in Supabase results bucket
        const imageResponse = await fetch(imageUrl);
        const imageBlob = await imageResponse.arrayBuffer();

        const resultPath = `${userId}/${generationId}/${i}.jpg`;
        await supabase.storage
          .from("results")
          .upload(resultPath, imageBlob, {
            contentType: "image/jpeg",
            upsert: true,
          });

        const {
          data: { publicUrl },
        } = supabase.storage.from("results").getPublicUrl(resultPath);

        resultUrls.push(publicUrl);
      }
    } catch (err) {
      console.error(`Failed to generate headshot ${i + 1}:`, err);
    }
  }

  await supabase
    .from("generations")
    .update({
      status: resultUrls.length > 0 ? "complete" : "failed",
      result_urls: resultUrls,
      error_message: resultUrls.length === 0 ? "All headshots failed to generate" : null,
    })
    .eq("id", generationId);

  // Send completion email
  if (resultUrls.length > 0) {
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    if (userData?.user?.email) {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-results-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.user.email,
          generationId,
        }),
      }).catch(console.error);
    }
  }
}
