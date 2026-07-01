import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
    }

    const generationId = session.metadata?.generationId;
    const userId = session.metadata?.userId;

    if (!generationId || !userId) {
      return NextResponse.json({ error: "Invalid session metadata" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Update status to paid
    const { data: generation, error } = await supabase
      .from("generations")
      .update({ status: "paid" })
      .eq("id", generationId)
      .eq("stripe_session_id", sessionId)
      .select()
      .single();

    if (error) {
      console.error("Error updating generation:", error);
      return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }

    // Trigger generation in background (fire and forget)
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.VERCEL_URL ||
      `https://${request.headers.get("host")}` ||
      "http://localhost:3000";
    fetch(`${appUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ generationId, userId }),
    }).catch(console.error);

    return NextResponse.json({ generationId, status: "paid" });
  } catch (err) {
    console.error("Verify session error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
