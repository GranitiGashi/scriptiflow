'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';
import authManager from '@/lib/auth';

type Car = {
  id: string;
  url: string;
  make: string;
  model: string;
  modelDescription: string;
  price: string;
  currency: string;
  image: string | null;
  mileage: string;
  firstRegistration: string;
  fuel: string;
  power: string;
  gearbox: string;
};

type AdAccount = { id: string; name: string; currency?: string; account_status?: number };

export default function BoostPage() {
  const router = useRouter();
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const [car, setCar] = useState<Car | null>(null);
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [adAccountsError, setAdAccountsError] = useState<string>('');
  const [fbLoginUrl, setFbLoginUrl] = useState<string | null>(null);
  const [selectedAdAccount, setSelectedAdAccount] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>('');
  const [plan, setPlan] = useState<any>(null);
  const [creative, setCreative] = useState<any>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [serviceFee, setServiceFee] = useState<number>(0);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? sessionStorage.getItem('selected_car_for_boost') : null;
    if (!raw) {
      router.push('/dashboard/inventory');
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Car;
      setCar(parsed);
    } catch (_) {
      router.push('/dashboard/inventory');
    }
  }, [router]);

  useEffect(() => {
    if (car && !plan && !loadingAI) {
      // Auto-generate once when car loads
      fetchRecommendation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [car]);

  useEffect(() => {
    async function loadAdAccounts() {
      try {
        // Use auth manager for automatic token refresh
        const res = await authManager.authenticatedFetch(`${baseDomain}/api/ads/ad-accounts`, {
          headers: {
            Accept: 'application/json',
          }
        });
        
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const message = (errData as any).error || 'Failed to load ad accounts';
          setAdAccountsError(message);
          
          // If FB token missing, try to fetch login URL to help user connect
          if (String(message).toLowerCase().includes('facebook user token not found')) {
            try {
              const userString = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
              const user = userString ? JSON.parse(userString) : null;
              const loginRes = await authManager.authenticatedFetch(
                `${baseDomain}/api/fb/login-url?user_id=${encodeURIComponent(user?.id || '')}`, {
                headers: { Accept: 'application/json' },
              });
              if (loginRes.ok) {
                const loginData = await loginRes.json();
                setFbLoginUrl(loginData.auth_url);
              }
            } catch (_) {}
          }
          return;
        }
        
        const data = await res.json();
        const list: AdAccount[] = data?.data || data || [];
        setAdAccounts(list);
        if (list.length > 0) setSelectedAdAccount(list[0].id);
      } catch (e: any) {
        console.error('Error loading ad accounts:', e);
        setAdAccountsError(e.message || 'Failed to load ad accounts');
        
        // If it's an authentication error, the auth manager will handle redirecting to login
        if (e.message.includes('No valid access token')) {
          setAdAccountsError('Session expired. Please log in again.');
        }
      }
    }
    loadAdAccounts();
  }, [baseDomain]);

  const mainData = useMemo(() => {
    if (!car) return null;
    return {
      title: `${car.make} ${car.model}`.trim(),
      price_eur: car.price ? Number(car.price) : undefined,
      url: car.url,
      image_url: car.image || undefined,
      description: car.modelDescription || undefined,
      attributes: {
        mileage_km: car.mileage || undefined,
        first_registration: car.firstRegistration || undefined,
        fuel: car.fuel || undefined,
        power: car.power || undefined,
        gearbox: car.gearbox || undefined,
      },
    };
  }, [car]);

  async function fetchRecommendation() {
    if (!mainData) return;
    setLoadingAI(true);
    setAiError('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
      if (!token) throw new Error('Not authenticated');
      const res = await fetch(`${baseDomain}/api/ads/recommendation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'x-refresh-token': refreshToken || ''
        },
        body: JSON.stringify({ car: mainData, objective: 'auto', country: 'DE', language: 'de' })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error || 'Failed to get recommendation');
      }
      const data = await res.json();
      const proposal = data?.proposal || data;

      const mapObjective = (obj?: string) => {
        const key = (obj || '').toLowerCase();
        if (key.includes('lead')) return 'LEAD_GENERATION';
        if (key.includes('message')) return 'MESSAGES';
        if (key.includes('traffic') || key.includes('click')) return 'LINK_CLICKS';
        return 'LINK_CLICKS';
      };

      // Handle different key names from AI
      const durationDays = proposal.duration_days || proposal.recommended_duration || 7;
      const dailyBudgetEur = proposal.daily_budget_eur ?? proposal.daily_budget ?? (proposal.daily_budget_cents ? (Number(proposal.daily_budget_cents) / 100) : 10);

      // Convert target audience (best-effort) -> FB targeting
      const ta = proposal.targeting || proposal.target_audience;
      let targeting: any = undefined;
      if (ta) {
        targeting = { geo_locations: { countries: [proposal.country || 'DE'] } };
        const age = typeof ta.age === 'string' ? ta.age : undefined;
        if (age && age.includes('-')) {
          const [min, max] = age.split('-').map((n: string) => Number(n.trim()));
          if (!Number.isNaN(min)) targeting.age_min = min;
          if (!Number.isNaN(max)) targeting.age_max = max;
        }
        const gender = (ta.gender || '').toLowerCase();
        if (gender === 'male') targeting.genders = [1];
        if (gender === 'female') targeting.genders = [2];
        // interests would require FB interest IDs; skip for now
      }

      setPlan({
        objective: mapObjective(proposal.objective),
        duration_days: Number(durationDays) || 7,
        daily_budget_cents: Math.round(Number(dailyBudgetEur || 10) * 100),
        targeting,
        country: proposal.country || 'DE'
      });

      const creativeSrc = proposal.creative || proposal.ad_creative || {};
      const cta = creativeSrc.CTA || creativeSrc.cta || 'LEARN_MORE';
      setCreative({
        campaign_name: proposal.campaign_name || `${mainData.title} Campaign`,
        adset_name: proposal.adset_name || `${mainData.title} Ad Set`,
        ad_name: proposal.ad_name || `${mainData.title} Ad`,
        primary_text: creativeSrc.primary_text || `Check out this ${mainData.title}!`,
        headline: creativeSrc.headline || mainData.title,
        description: creativeSrc.description || mainData.description || '',
        cta,
        image_url: mainData.image_url,
        url: mainData.url,
        page_id: proposal.page_id || ''
      });
    } catch (e: any) {
      setAiError(e.message || 'Failed to get recommendation');
    } finally {
      setLoadingAI(false);
    }
  }

  async function handleLaunch() {
    if (!selectedAdAccount) {
      setSubmitError('Please select an ad account');
      return;
    }
    if (!plan || !creative) {
      setSubmitError('Missing plan or creative');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
      if (!token) throw new Error('Not authenticated');
      const res = await fetch(`${baseDomain}/api/ads/campaign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'x-refresh-token': refreshToken || ''
        },
        body: JSON.stringify({ ad_account_id: selectedAdAccount, plan, creative, charge_amount_cents: serviceFee > 0 ? Math.round(serviceFee * 100) : 0 })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error || 'Failed to create campaign');
      }
      const payload = await res.json();
      sessionStorage.removeItem('selected_car_for_boost');
      router.push(`/dashboard/social-media`);
    } catch (e: any) {
      setSubmitError(e.message || 'Failed to launch campaign');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Boost Car Ad</h1>
            <button className="text-sm text-gray-600 hover:underline" onClick={() => router.push('/dashboard/inventory')}>Back to Inventory</button>
          </div>

          {car && (
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-64 h-40 bg-gray-100 rounded overflow-hidden">
                  {car.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={car.image} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-800">{car.make} {car.model}</h2>
                  <p className="text-gray-600">{car.modelDescription}</p>
                  <div className="mt-2 text-gray-700 font-medium">{car.price} {car.currency}</div>
                  <a href={car.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm mt-2 inline-block">View listing</a>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">AI Recommendation</h3>
              <button onClick={fetchRecommendation} disabled={loadingAI || !car} className="bg-black text-white px-3 py-2 rounded disabled:opacity-60">
                {loadingAI ? 'Generating…' : 'Generate with AI'}
              </button>
            </div>
            {aiError && <div className="text-red-600 text-sm mb-2">{aiError}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600">Objective</label>
                <input value={plan?.objective || ''} onChange={(e) => setPlan((p: any) => ({ ...(p || {}), objective: e.target.value }))} className="w-full border rounded p-2" placeholder="LINK_CLICKS" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Duration (days)</label>
                <input type="number" value={plan?.duration_days || ''} onChange={(e) => setPlan((p: any) => ({ ...(p || {}), duration_days: Number(e.target.value) }))} className="w-full border rounded p-2" placeholder="7" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Daily Budget (EUR)</label>
                <input type="number" value={plan?.daily_budget_cents ? (plan.daily_budget_cents / 100) : ''} onChange={(e) => setPlan((p: any) => ({ ...(p || {}), daily_budget_cents: Math.round(Number(e.target.value || 0) * 100) }))} className="w-full border rounded p-2" placeholder="10" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Country</label>
                <input value={plan?.country || ''} onChange={(e) => setPlan((p: any) => ({ ...(p || {}), country: e.target.value }))} className="w-full border rounded p-2" placeholder="DE" />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm text-gray-600">Targeting (JSON)</label>
              <textarea value={plan?.targeting ? JSON.stringify(plan.targeting, null, 2) : ''} onChange={(e) => {
                try { setPlan((p: any) => ({ ...(p || {}), targeting: e.target.value ? JSON.parse(e.target.value) : undefined })); } catch (_) {}
              }} className="w-full border rounded p-2 font-mono text-sm min-h-[120px]" placeholder='{"geo_locations": {"countries": ["DE"]}}' />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Ad Creative</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600">Primary Text</label>
                <textarea value={creative?.primary_text || ''} onChange={(e) => setCreative((c: any) => ({ ...(c || {}), primary_text: e.target.value }))} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Headline</label>
                <input value={creative?.headline || ''} onChange={(e) => setCreative((c: any) => ({ ...(c || {}), headline: e.target.value }))} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Description</label>
                <input value={creative?.description || ''} onChange={(e) => setCreative((c: any) => ({ ...(c || {}), description: e.target.value }))} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">CTA</label>
                <input value={creative?.cta || ''} onChange={(e) => setCreative((c: any) => ({ ...(c || {}), cta: e.target.value }))} className="w-full border rounded p-2" placeholder="LEARN_MORE" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Landing URL</label>
                <input value={creative?.url || ''} onChange={(e) => setCreative((c: any) => ({ ...(c || {}), url: e.target.value }))} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Image URL</label>
                <input value={creative?.image_url || ''} onChange={(e) => setCreative((c: any) => ({ ...(c || {}), image_url: e.target.value }))} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Facebook Page ID</label>
                <input value={creative?.page_id || ''} onChange={(e) => setCreative((c: any) => ({ ...(c || {}), page_id: e.target.value }))} className="w-full border rounded p-2" placeholder="1234567890" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600">Ad Account</label>
                <select className="w-full border rounded p-2" value={selectedAdAccount} onChange={(e) => setSelectedAdAccount(e.target.value)}>
                  <option value="">Select an ad account</option>
                  {adAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.id})</option>
                  ))}
                </select>
                {adAccountsError && (
                  <div className="text-sm text-red-600 mt-2">{adAccountsError}</div>
                )}
                {!adAccounts.length && fbLoginUrl && (
                  <button onClick={() => (window.location.href = fbLoginUrl)} className="mt-3 bg-blue-600 text-white px-3 py-2 rounded">
                    Connect Facebook to Continue
                  </button>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-600">Service Fee (EUR)</label>
                <input type="number" min={0} step={1} value={serviceFee} onChange={(e) => setServiceFee(Number(e.target.value))} className="w-full border rounded p-2" placeholder="0" />
                <p className="text-xs text-gray-500 mt-1">If set, this will be charged from your saved card before creating the campaign.</p>
              </div>
            </div>

            {submitError && <div className="text-red-600 text-sm mt-3">{submitError}</div>}

            <div className="flex items-center gap-3 mt-6">
              <button onClick={handleLaunch} disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-60">
                {submitting ? 'Launching…' : 'Continue & Launch'}
              </button>
              <button onClick={() => router.push('/dashboard/payments/save-card')} className="text-sm text-blue-600">Manage Payment Method</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


