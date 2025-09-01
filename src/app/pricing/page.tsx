import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

// Stripe integration disabled for minimal deployment

const pricingPlans = [
  {
    name: "Basic",
    price: "$1.99",
    credits: "50 credits",
    features: [
      "50 AI video generations",
      "720p video quality",
      "Basic support",
      "Standard processing",
    ],
  },
  {
    name: "Pro",
    price: "$5.99",
    credits: "200 credits",
    features: [
      "200 AI video generations",
      "1080p video quality",
      "Priority support",
      "Fast processing",
      "Advanced models",
    ],
  },
  {
    name: "Enterprise",
    price: "$10.99",
    credits: "500 credits",
    features: [
      "500 AI video generations",
      "4K video quality",
      "24/7 Premium support",
      "Fastest processing",
      "All models access",
      "API access",
    ],
  },
];

export default function PricingPage() {
  const handleSubscription = async (priceId: string) => {
    alert("Subscription features are disabled for minimal deployment. Please use the app with the free tier!");
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground">
          Start with 10 free credits. Upgrade anytime for more features.
        </p>
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            💡 Currently running in minimal deployment mode - subscriptions are disabled. Use the app with free tier features!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {pricingPlans.map((plan, index) => (
          <Card key={plan.name} className={`relative ${index === 1 ? 'border-primary scale-105' : ''}`}>
            {index === 1 && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="text-3xl font-bold text-foreground">
                {plan.price}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </CardDescription>
              <CardDescription>{plan.credits}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={index === 1 ? "default" : "outline"}
                onClick={() => handleSubscription(plan.name)}
              >
                Get Started
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center mt-16">
        <p className="text-muted-foreground">
          All plans include access to our AI models and cloud processing.
        </p>
      </div>
    </div>
  );
}