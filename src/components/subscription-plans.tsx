import { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { loadStripe } from '@stripe/stripe-js';

const SUBSCRIPTION_TIERS = {
  BASIC: {
    name: 'Basic Plan',
    price: 1.99,
    credits: 50,
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID,
    features: [
      '50 credits per month',
      'Basic AI image generation',
      'Standard video quality',
      'Email support'
    ]
  },
  PRO: {
    name: 'Pro Plan',
    price: 5.99,
    credits: 150,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    features: [
      '150 credits per month',
      'Advanced AI generation',
      'HD video quality',
      'Priority support',
      'Custom presets'
    ]
  },
  PREMIUM: {
    name: 'Premium Plan',
    price: 10.99,
    credits: 400,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      '400 credits per month',
      'Premium AI generation',
      '4K video quality',
      '24/7 Priority support',
      'Custom presets',
      'API access'
    ]
  }
};

export default function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubscribe = async (planKey: string) => {
    try {
      setIsLoading(true);
      setSelectedPlan(planKey);
      
      const plan = SUBSCRIPTION_TIERS[planKey as keyof typeof SUBSCRIPTION_TIERS];
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }
      
      const { sessionId } = await response.json();
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(SUBSCRIPTION_TIERS).map(([key, plan]) => (
          <Card key={key} className="flex flex-col">
            <CardHeader>
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="text-3xl font-bold">
                ${plan.price}
                <span className="text-base font-normal">/month</span>
              </p>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
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
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleSubscribe(key)}
                variant={key === 'PRO' ? 'default' : 'outline'}
                disabled={isLoading && selectedPlan === key}
              >
                {isLoading && selectedPlan === key ? 'Processing...' : 'Subscribe Now'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 