'use client';

import { button as Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { loadStripe } from "@stripe/stripe-js";

const pricingPlans = [
  {
    name: "Basic",
    price: "$1.99",
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID,
    credits: "50",
    features: [
      "50 AI video generations",
      "720p video quality",
      "Basic support",
      "Access to core features",
    ],
  },
  {
    name: "Pro",
    price: "$5.99",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    credits: "200",
    features: [
      "200 AI video generations",
      "1080p video quality",
      "Priority support",
      "Advanced editing features",
      "Custom video length",
    ],
  },
  {
    name: "Enterprise",
    price: "$10.99",
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
    credits: "500",
    features: [
      "500 AI video generations",
      "4K video quality",
      "24/7 Premium support",
      "All advanced features",
      "Custom branding",
      "API access",
    ],
  },
];

export default function PricingPage() {
  const handleSubscription = async (priceId: string) => {
    try {
      const response = await fetch("/api/stripe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });

      const { sessionId } = await response.json();
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
      );

      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground">
          Start with 10 free credits. Upgrade anytime for more features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {pricingPlans.map((plan) => (
          <Card key={plan.name} className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <div className="mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <div className="mb-6">
                <span className="text-xl font-semibold text-primary">
                  {plan.credits} Credits
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => handleSubscription(plan.priceId!)}
            >
              Subscribe Now
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
