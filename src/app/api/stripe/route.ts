import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/auth.config";
import Stripe from "stripe";
// Placeholder subscription tiers
const SUBSCRIPTION_TIERS = {
  free: { name: "Free", price: 0, credits: 10, features: ["Basic features"] },
  pro: { name: "Pro", price: 29, credits: 100, features: ["Pro features"] },
  enterprise: { name: "Enterprise", price: 99, credits: 1000, features: ["Enterprise features"] }
};

type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { tier } = await req.json() as { tier: SubscriptionTier };
  
  if (!tier || !(tier in SUBSCRIPTION_TIERS)) {
    return new NextResponse("Invalid subscription tier", { status: 400 });
  }

  const price = SUBSCRIPTION_TIERS[tier].price;

  try {
    const stripeSession = await stripe.checkout.sessions.create({
      customer: session.user.stripeCustomerId || undefined,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${SUBSCRIPTION_TIERS[tier].name} Subscription`,
              description: SUBSCRIPTION_TIERS[tier].features.join(" • "),
            },
            unit_amount: price * 100,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/app?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/app`,
      metadata: {
        userId: session.user.id,
        tier,
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    return new NextResponse("Error creating checkout session", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return new NextResponse("Session ID is required", { status: 400 });
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (checkoutSession.customer !== session.user.stripeCustomerId) {
      return new NextResponse("Invalid session", { status: 400 });
    }

    if (!checkoutSession.metadata?.tier) {
      return new NextResponse("Invalid session metadata", { status: 400 });
    }

    const subscription = await stripe.subscriptions.retrieve(
      checkoutSession.subscription as string
    );

    // Update session with new subscription tier
    session.user.subscriptionTier = checkoutSession.metadata.tier as SubscriptionTier;
    session.user.credits = SUBSCRIPTION_TIERS[session.user.subscriptionTier].credits;

    return NextResponse.json({
      status: subscription.status,
      tier: session.user.subscriptionTier,
      credits: session.user.credits,
    });
  } catch (error) {
    console.error("Error retrieving subscription:", error);
    return new NextResponse("Error retrieving subscription", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!session.user.stripeCustomerId) {
    return new NextResponse("No active subscription", { status: 400 });
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: session.user.stripeCustomerId,
      status: "active",
    });

    if (!subscriptions.data.length) {
      return new NextResponse("No active subscription", { status: 400 });
    }

    // Cancel all active subscriptions
    for (const subscription of subscriptions.data) {
      await stripe.subscriptions.cancel(subscription.id);
    }

    // Update session
    session.user.subscriptionTier = "free";
    session.user.credits = SUBSCRIPTION_TIERS.free.credits;

    return NextResponse.json({
      message: "Subscription cancelled",
      tier: session.user.subscriptionTier,
      credits: session.user.credits,
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return new NextResponse("Error cancelling subscription", { status: 500 });
  }
}
