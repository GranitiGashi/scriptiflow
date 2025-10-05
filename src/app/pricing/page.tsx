'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

type Plan = 'basic' | 'pro' | 'premium';

const PLANS: { key: Plan; name: string; price: string }[] = [
  { key: 'basic', name: 'Basic', price: '99€ / Monat' },
  { key: 'pro', name: 'Pro', price: '149€ / Monat' },
  { key: 'premium', name: 'Premium', price: '299€ / Monat' },
];

const FEATURES: { label: string; basic: string; pro: string; premium: string }[] = [
  { label: 'Inventory import & listing sync', basic: '✅', pro: '✅ + Boost', premium: '✅' },
  { label: 'Boost Ads (campaigns)', basic: '❌', pro: '✅', premium: '✅' },
  { label: 'Social auto-post (FB/IG)', basic: '✅', pro: '✅', premium: '✅' },
  { label: 'WhatsApp integration', basic: '❌', pro: '❌', premium: '✅' },
  { label: 'Email leads (Gmail/Outlook)', basic: '❌', pro: '✅', premium: '✅' },
  { label: 'Calendar (events CRUD)', basic: '❌', pro: '✅', premium: '✅' },
  { label: 'Contacts (CRM)', basic: '❌', pro: '✅', premium: '✅' },
  { label: 'Payments / Stripe', basic: '❌', pro: '✅', premium: '✅' },
  { label: 'Branding uploads (Logo)', basic: '✅', pro: '✅', premium: '✅' },
  { label: 'Plan visibility (Settings)', basic: '✅', pro: '✅', premium: '✅' },
  { label: 'WhatsApp inbox', basic: '❌', pro: '❌', premium: '✅' },
  { label: 'Email Inbox', basic: '❌', pro: '✅', premium: '✅' },
  { label: 'Support', basic: '✅ (Standard)', pro: '✅', premium: '✅ (Priority)' },
  { label: 'Background remover', basic: '❌', pro: '❌', premium: '✅' },
];

export default function PricingPage() {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const [open, setOpen] = useState<Plan | null>(null);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Pre-select plan from query param if present
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const plan = params.get('plan');
      if (plan === 'basic' || plan === 'pro' || plan === 'premium') {
        setOpen(plan);
        setSelectedPlan(plan);
      }
    } catch {}
  }, []);

  async function startCheckout(plan: Plan) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseDomain}/api/pricing/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan, email, full_name: fullName, company_name: company }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout-Session fehlgeschlagen');
      if (data.url) window.location.href = data.url;
    } catch (e: any) {
      setError(e.message || 'Fehler beim Starten des Checkouts');
    } finally {
      setLoading(false);
    }
  }

  return (
      <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
        <h1 className="text-3xl font-bold text-center mb-8">Preise</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {PLANS.map((p) => (
            <div key={p.key} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-2">{p.name}</h2>
              <div className="text-2xl font-bold mb-4">{p.price}</div>
              <ul className="text-sm text-gray-700 space-y-2 mb-6">
                {FEATURES.map((f) => (
                  <li key={f.label} className="flex items-start justify-between">
                    <span>• {f.label}</span>
                    <span className="ml-3 text-gray-900 font-medium">
                      {p.key === 'basic' ? f.basic : p.key === 'pro' ? f.pro : f.premium}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => { setOpen(p.key); setSelectedPlan(p.key); }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2"
              >
                Plan wählen
              </button>
            </div>
          ))}
        </div>

        {open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{PLANS.find(p => p.key === open)?.name} abonnieren</h3>
                <button onClick={() => setOpen(null)} className="text-gray-500">✕</button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">E‑Mail</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full border rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Vollständiger Name</label>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} type="text" className="w-full border rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Firmenname</label>
                  <input value={company} onChange={e => setCompany(e.target.value)} type="text" className="w-full border rounded-md px-3 py-2" />
                </div>
                {error && <div className="text-sm text-red-600">{error}</div>}
                <button
                  onClick={() => startCheckout(open)}
                  disabled={loading || !email}
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 disabled:opacity-60"
                >
                  {loading ? 'Weiter…' : 'Weiter zur Zahlung'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}


