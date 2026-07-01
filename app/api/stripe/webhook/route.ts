import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status === "paid") {
        const generationId = session.metadata?.generationId;
        const userId = session.metadata?.userId;

        if (generationId && userId) {
          const supabase = createAdminClient();

          // Update generation to paid
          await supabase
            .from("generations")
            .update({ status: "paid" })
            .eq("id", generationId)
            .eq("user_id", userId);

          // Trigger generation
          const appUrl =
            process.env.NEXT_PUBLIC_APP_URL ||
            process.env.VERCEL_URL ||
            "https://headsnap.vercel.app";
          await fetch(`${appUrl}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ generationId, userId }),
          }).catch(console.error);
        }
      }
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const generationId = session.metadata?.generationId;

      if (generationId) {
        const supabase = createAdminClient();
        await supabase
          .from("generations")
          .update({ status: "failed", error_message: "Payment expired" })
          .eq("id", generationId);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
