import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { email, generationId } = await request.json();

    if (!email || !generationId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: generation } = await supabase
      .from("generations")
      .select("status, result_urls")
      .eq("id", generationId)
      .single();

    if (!generation || generation.status !== "complete") {
      return NextResponse.json({ error: "Generation not complete" }, { status: 400 });
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.VERCEL_URL ||
      "https://headsnap.vercel.app";
    const resultsUrl = `${appUrl}/results/${generationId}`;
    const count = generation.result_urls?.length ?? 0;

    await resend.emails.send({
      from: "headsnap.ai <noreply@headsnap.ai>",
      to: email,
      subject: "Your AI headshots are ready!",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your headshots are ready</title>
</head>
<body style="background:#0a0a0a;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:48px 24px;">
    <div style="margin-bottom:32px;">
      <span style="font-size:24px;font-weight:700;background:linear-gradient(135deg,#a78bfa,#60a5fa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">headsnap.ai</span>
    </div>

    <div style="background:#ffffff08;border:1px solid #ffffff15;border-radius:16px;padding:40px;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:#22c55e20;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:24px;">
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#22c55e" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
      </div>

      <h1 style="font-size:28px;font-weight:700;color:#ffffff;margin:0 0 12px;">Your headshots are ready!</h1>
      <p style="color:#ffffff99;font-size:16px;line-height:1.6;margin:0 0 32px;">
        We've generated <strong style="color:#ffffff;">${count} professional headshots</strong> for you. Click below to view and download them.
      </p>

      <a href="${resultsUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#ffffff;font-size:16px;font-weight:600;padding:14px 32px;border-radius:12px;text-decoration:none;">
        View my headshots →
      </a>
    </div>

    <div style="background:#ffffff05;border:1px solid #ffffff10;border-radius:12px;padding:20px;margin-bottom:32px;">
      <p style="color:#ffffff60;font-size:14px;margin:0 0 8px;font-weight:600;">IMPORTANT</p>
      <p style="color:#ffffff80;font-size:14px;margin:0;">
        Your headshots will be available for <strong style="color:#ffffff;">7 days</strong>. Make sure to download them before they expire.
      </p>
    </div>

    <p style="color:#ffffff30;font-size:12px;text-align:center;margin:0;">
      headsnap.ai ·
      <a href="${appUrl}" style="color:#ffffff50;text-decoration:none;">headsnap.ai</a> ·
      <a href="mailto:support@headsnap.ai" style="color:#ffffff50;text-decoration:none;">support@headsnap.ai</a>
    </p>
  </div>
</body>
</html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
