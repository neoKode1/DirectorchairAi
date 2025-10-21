import { Check } from 'lucide-react';
import { checkoutAction } from '@/lib/payments/actions';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { SubmitButton } from './submit-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function PricingPage() {
  // Only fetch Stripe data if Stripe is configured
  let prices = [];
  let products = [];
  
  try {
    [prices, products] = await Promise.all([
      getStripePrices(),
      getStripeProducts(),
    ]);
  } catch (error) {
    console.log('Stripe not configured, using default pricing');
  }

  // Define your subscription plans
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '20 credits per month',
        'Basic models access',
        'Community gallery',
        'Standard support',
      ],
      priceId: null, // Free plan
      highlighted: false,
    },
    {
      name: 'Weekly Pro',
      price: '$7.50',
      period: 'week',
      description: 'Great for casual creators',
      features: [
        '150 credits per week',
        'All image models',
        'Priority processing',
        'HD downloads',
        'Email support',
      ],
      priceId: process.env.STRIPE_WEEKLY_PRO_PRICE_ID,
      highlighted: true,
    },
    {
      name: 'Heavy',
      price: '$14.99',
      period: 'month',
      description: 'For power users',
      features: [
        '375 credits per month',
        'All models (image + video)',
        'Fastest processing',
        '4K downloads',
        'Priority support',
        'Commercial license',
      ],
      priceId: process.env.STRIPE_MONTHLY_PRO_PRICE_ID,
      highlighted: false,
    },
  ];

  // Define credit packs
  const creditPacks = [
    {
      name: 'Credit Pack 5',
      price: '$6.25',
      credits: 125,
      description: 'Perfect for trying premium features',
      priceId: process.env.STRIPE_CREDIT_PACK_5_PRICE_ID,
      highlighted: false,
    },
    {
      name: 'Credit Pack 10',
      price: '$12.50',
      credits: 250,
      description: 'Great value for regular users',
      priceId: process.env.STRIPE_CREDIT_PACK_10_PRICE_ID,
      highlighted: true,
    },
    {
      name: 'Credit Pack 25',
      price: '$31.25',
      credits: 625,
      description: 'Best value for heavy users',
      priceId: process.env.STRIPE_CREDIT_PACK_25_PRICE_ID,
      highlighted: false,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Unlock the full potential of Director's Chair AI with our flexible pricing
            plans. Create stunning images, videos, and audio with all your
            favorite AI models.
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Subscription Plans
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.highlighted
                    ? 'border-purple-500 shadow-lg ring-2 ring-purple-500'
                    : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-500 hover:bg-purple-600">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-base">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-5xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 text-lg">/{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.priceId ? (
                    <form action={checkoutAction}>
                      <input type="hidden" name="priceId" value={plan.priceId} />
                      <SubmitButton />
                    </form>
                  ) : (
                    <button
                      disabled
                      className="w-full rounded-full py-3 px-6 bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                    >
                      Current Plan
                    </button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Credit Packs */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Credit Packs
          </h2>
          <p className="text-gray-500 text-center mb-8 max-w-2xl mx-auto">
            Need more generations? Purchase credit packs that never expire and
            work with any plan.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {creditPacks.map((pack) => (
              <Card
                key={pack.name}
                className={`relative ${
                  pack.highlighted
                    ? 'border-purple-500 shadow-lg ring-2 ring-purple-500'
                    : ''
                }`}
              >
                {pack.highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-500 hover:bg-purple-600">
                      Best Value
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <CardTitle className="text-xl mb-2">{pack.name}</CardTitle>
                  <CardDescription>{pack.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {pack.price}
                    </span>
                  </div>
                  <p className="text-gray-500 mt-2">{pack.credits} credits</p>
                  <p className="text-gray-400 text-sm">
                    $
                    {(
                      parseFloat(pack.price.replace('$', '')) / pack.credits
                    ).toFixed(4)}{' '}
                    per credit
                  </p>
                </CardHeader>

                <CardContent>
                  {pack.priceId ? (
                    <form action={checkoutAction}>
                      <input type="hidden" name="priceId" value={pack.priceId} />
                      <SubmitButton />
                    </form>
                  ) : (
                    <button
                      disabled
                      className="w-full rounded-full py-3 px-6 bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                    >
                      Coming Soon
                    </button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Can I change plans anytime?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! You can upgrade or downgrade your plan at any time. Changes
                  take effect immediately.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do credits expire?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Subscription credits reset monthly/weekly. Purchased credit packs
                  never expire!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  What happens if I exceed my limit?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You can purchase additional credit packs or upgrade your plan.
                  We'll notify you when you're approaching your limit.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! The free plan gives you 20 credits to try out our platform.
                  No credit card required.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
