'use client';

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { button as Button } from "@/components/ui/button";

// Stripe integration disabled for minimal deployment

const SUBSCRIPTION_TIERS = {
  BASIC: {
    name: "Basic Plan",
    price: 1.99,
    credits: 50,
    features: [
      "50 credits per month",
      "Basic AI image generation",
      "Standard video quality",
      "Email support",
    ],
  },
  PRO: {
    name: "Pro Plan",
    price: 5.99,
    credits: 150,
    features: [
      "150 credits per month",
      "Advanced AI generation",
      "HD video quality",
      "Priority support",
      "Custom presets",
    ],
  },
  PREMIUM: {
    name: "Premium Plan",
    price: 10.99,
    credits: 400,
    features: [
      "400 credits per month",
      "Premium AI generation",
      "4K video quality",
      "24/7 Priority support",
      "Custom presets",
      "API access",
    ],
  },
};

export default function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (planKey: string) => {
    alert("Subscription features are disabled for minimal deployment. Please use the app with the free tier!");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => (
          <Card key={key} className="relative">
            <CardHeader>
              <h3 className="text-xl font-semibold">{tier.name}</h3>
              <div className="text-3xl font-bold">
                ${tier.price}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleSubscribe(key)}
                disabled={isLoading && selectedPlan === key}
              >
                {isLoading && selectedPlan === key ? "Processing..." : "Subscribe"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="text-center mt-8 text-sm text-muted-foreground">
        <p>💡 Currently running in minimal deployment mode - subscriptions are disabled.</p>
        <p>Use the app with free tier features!</p>
      </div>
    </div>
  );
}