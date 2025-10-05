'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import authManager from '@/lib/auth';

type PlanKey = 'basic' | 'pro' | 'premium';

const HOME_PLANS: Record<PlanKey, { key: PlanKey; name: string; price: string; description: string; features: string[]; popular?: boolean }> = {
  basic: {
    key: 'basic',
    name: 'Starter',
    price: '€299/mo',
    description: 'Perfect for small dealerships',
    features: [
      'Mobile.de integration',
      'Basic social media posting',
      'Email campaigns',
      'Basic analytics',
      'Up to 100 cars',
    ],
  },
  pro: {
    key: 'pro',
    name: 'Professional',
    price: '€599/mo',
    description: 'Most popular for growing dealerships',
    features: [
      'Everything in Starter',
      'AI-powered ads',
      'Advanced autoposting',
      'Custom email templates',
      'Advanced analytics',
      'Up to 500 cars',
      'Priority support',
    ],
    popular: true,
  },
  premium: {
    key: 'premium',
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large dealership groups',
    features: [
      'Everything in Professional',
      'Unlimited cars',
      'Custom integrations',
      'Dedicated account manager',
      'White-label options',
      'API access',
      'Custom training',
    ],
  },
};

export default function PricingPaymentPage() {
  const params = useSearchParams();
  const planParam = (params.get('plan') as PlanKey) || 'pro';
  const selectedPlan: PlanKey = ['basic', 'pro', 'premium'].includes(planParam) ? planParam : 'pro';
  const plan = HOME_PLANS[selectedPlan];
  const isPremium = selectedPlan === 'premium';

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';

  const [email, setEmail] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [company, setCompany] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const user = authManager.getCurrentUser();
      if (user?.email) setEmail(user.email);
      if (user?.user_metadata?.full_name) setFullName(user.user_metadata.full_name);
      if (user?.user_metadata?.company) setCompany(user.user_metadata.company);
    } catch {}
  }, []);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      if (!email) throw new Error('Please enter your email');
      const res = await fetch(`${baseDomain}/api/pricing/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, email, full_name: fullName, company_name: company }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout');
      if (data.url) window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white">
      <div className="px-4 md:px-8 lg:px-16 pt-28 pb-16">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-violet-200 to-cyan-200">Checkout</span>
            </h1>
            <p className="text-slate-300 mt-3">Complete your subscription to ScriptiFlow</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{plan.name}</h2>
                {plan.popular && (
                  <span className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-violet-500 to-purple-500">Most Popular</span>
                )}
              </div>
              <div className="text-4xl font-extrabold text-violet-400 mb-2">{plan.price}</div>
              <p className="text-slate-300 mb-6">{plan.description}</p>

              <div className="space-y-3">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-3 text-slate-200">
                    <CheckCircle2 className="h-5 w-5 text-violet-400 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-sm text-slate-400">
                <p>By subscribing you agree to our Terms and Privacy Policy.</p>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-6">Your details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="you@company.com"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Full name</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    type="text"
                    placeholder="John Doe"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Company</label>
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    type="text"
                    placeholder="Acme GmbH"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
                  />
                </div>

                {error && <div className="text-sm text-red-400">{error}</div>}

                {isPremium ? (
                  <Button
                    onClick={() => (window.location.href = 'mailto:hello@scriptiflow.com?subject=Enterprise%20Plan%20Inquiry')}
                    className="w-full py-3 rounded-xl font-semibold bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    Contact Sales
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleCheckout}
                    disabled={loading || !email}
                    className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                  >
                    {loading ? 'Processing…' : 'Proceed to Payment'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                )}

                <p className="text-xs text-slate-500 text-center">Secure checkout powered by Stripe</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


