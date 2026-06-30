import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { generationId, email } = await request.json();

    if (!generationId) {
      return NextResponse.json({ error: "Missing generationId" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email ?? user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "AI Headshot Generation",
              description: "50 professional AI-generated headshots delivered to your email",
              images: [`${appUrl}/og-image.png`],
            },
            unit_amount: 1500,
          },
          quantity: 1,
        },
      ],
      metadata: {
        generationId,
        userId: user.id,
      },
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/upload`,
    });

    // Save stripe session ID to generation record
    await supabase
      .from("generations")
      .update({ stripe_session_id: session.id })
      .eq("id", generationId)
      .eq("user_id", user.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
