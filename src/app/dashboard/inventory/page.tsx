'use client';

import { hasTierOrAbove, getUserTier } from '@/lib/permissions';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCar } from 'react-icons/fa';
import authManager from '@/lib/auth';
import { Dialog } from '@mui/material';

interface Car {
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
  dealerCity?: string | null;
  dealerZip?: string | null;
  dealerLat?: number | null;
  dealerLon?: number | null;
}

export default function InventoryPage() {
  const allowed = hasTierOrAbove('pro');
  const tier = getUserTier();
  const [cars, setCars] = useState<Car[]>([]);
  const [filtered, setFiltered] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileDeConnected, setMobileDeConnected] = useState(false);
  const [as24Connected, setAs24Connected] = useState(false);
  const router = useRouter();
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const [search, setSearch] = useState<{ make?: string; model?: string; q?: string }>({});
  const [searchDraft, setSearchDraft] = useState<{ make: string; model: string; q: string }>({ make: '', model: '', q: '' });
  const [sort, setSort] = useState<'newest' | 'oldest' | 'makeModelAsc' | 'makeModelDesc'>('newest');
  const [availableMakes, setAvailableMakes] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewCaption, setPreviewCaption] = useState<string>('');
  const [previewCar, setPreviewCar] = useState<Car | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<{ facebook: boolean; instagram: boolean }>({ facebook: true, instagram: true });
  const [selectedIdxs, setSelectedIdxs] = useState<Set<number>>(new Set());
  const [autoSelectTop10, setAutoSelectTop10] = useState(true);
  const [posting, setPosting] = useState(false);

  // Check if mobile.de account is connected
  useEffect(() => {
    async function checkConnection() {
      try {
        const res = await authManager.authenticatedFetch(`${baseDomain}/api/connect-mobile-de`, {
          headers: {
            Accept: 'application/json',
          },
        });

        if (!res.ok) throw new Error('Please connect your mobile.de account.');
        setMobileDeConnected(true);
        try {
          const as24 = await authManager.authenticatedFetch(`${baseDomain}/api/autoscout24/connect`, { headers: { Accept: 'application/json' } });
          if (as24.ok) setAs24Connected(true);
        } catch (_) {}
      } catch (err: any) {
        console.error('Connection check failed:', err);
        try {
          const as24 = await authManager.authenticatedFetch(`${baseDomain}/api/autoscout24/connect`, { headers: { Accept: 'application/json' } });
          if (as24.ok) {
            setAs24Connected(true);
            setError(null);
            return;
          }
        } catch (_) {}
        setError(err.message);
        if (err.message.includes('No valid access token')) {
          setError('Session expired. Please log in again.');
        } else {
          router.push('/connect');
        }
      }
    }

    checkConnection();
  }, [baseDomain, router]);

  // Fetch cars after confirming connection and whenever search/sort changes
  useEffect(() => {
    if (!mobileDeConnected && !as24Connected) return;

    async function fetchCars() {
      setLoading(true);
      setError(null);
      try {
        let url = mobileDeConnected
          ? `${baseDomain}/api/get-user-cars`
          : `${baseDomain}/api/autoscout24/remote-listings`;

        if (mobileDeConnected) {
          const params = new URLSearchParams();
          params.set('page.number', '1');
          params.set('page.size', '50');
          if (sort === 'newest') { params.set('sort.field', 'modificationTime'); params.set('sort.order', 'DESCENDING'); }
          if (sort === 'oldest') { params.set('sort.field', 'modificationTime'); params.set('sort.order', 'ASCENDING'); }
          if (sort === 'makeModelAsc') { params.set('sort.field', 'makeModel'); params.set('sort.order', 'ASCENDING'); }
          if (sort === 'makeModelDesc') { params.set('sort.field', 'makeModel'); params.set('sort.order', 'DESCENDING'); }
          if ((search.make || '').trim()) params.set('make', String(search.make).trim());
          if ((search.model || '').trim()) params.set('model', String(search.model).trim());
          if ((search.q || '').trim()) params.set('q', String(search.q).trim());
          url += `?${params.toString()}`;
        }
        const res = await authManager.authenticatedFetch(url, {
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to fetch cars.');
        }

        const data = await res.json();
        let rawCars: any[] = [];
        if (mobileDeConnected) {
          rawCars = Array.isArray(data?.['search-result']?.ads?.ad)
            ? data['search-result'].ads.ad
            : Array.isArray(data?.ads)
            ? data.ads
            : Array.isArray(data)
            ? data
            : [];
        } else {
          rawCars = Array.isArray(data)
            ? data
            : (Array.isArray(data?.items) ? data.items : []);
        }

        const mappedCars: Car[] = rawCars.map((c: any) => {
          const id = c['@key'] || c.mobileAdId || c.id || c.listingId || '';
          const make = c?.vehicle?.make?.['@key'] || c?.vehicle?.make || c?.make || '';
          const model = c?.vehicle?.model?.['@key'] || c?.vehicle?.model || c?.model || '';
          const modelDescription = c?.vehicle?.['model-description']?.['@value'] || c?.modelDescription || '';

          let priceVal: any = '';
          if (c?.price?.['consumer-price-amount']?.['@value']) priceVal = c.price['consumer-price-amount']['@value'];
          else if (c?.price?.consumerPrice?.amount?.['@value']) priceVal = c.price.consumerPrice.amount['@value'];
          else if (c?.price?.consumerPrice?.amount != null) priceVal = c.price.consumerPrice.amount;
          else if (c?.price?.amount?.['@value']) priceVal = c.price.amount['@value'];
          else if (c?.price?.amount != null) priceVal = c.price.amount;
          else if (typeof c?.price === 'number' || typeof c?.price === 'string') priceVal = c.price;
          const priceStr = (priceVal != null && typeof priceVal !== 'object') ? String(priceVal) : '';
          let currency = 'EUR';
          if (typeof c?.price?.['@currency'] === 'string') currency = c.price['@currency'];
          else if (typeof c?.price?.consumerPrice?.currency === 'string') currency = c.price.consumerPrice.currency;
          else if (typeof c?.price?.['consumer-price-amount']?.['@currency'] === 'string') currency = c.price['consumer-price-amount']['@currency'];
          else if (typeof c?.currency === 'string') currency = c.currency;

          let image: string | null = null;
          if (mobileDeConnected) {
            if (Array.isArray(c?.images) && c.images.length > 0) {
              const i0 = c.images[0];
              image = i0?.xxxl || i0?.xxl || i0?.xl || i0?.l || i0?.m || i0?.s || null;
            } else if (c?.images?.image?.representation?.[0]?.['@url']) {
              image = c.images.image.representation[0]['@url'];
            }
          } else {
            const imgs = Array.isArray(c?.images) ? c.images : (Array.isArray(c?.media) ? c.media : []);
            if (imgs.length) {
              const i0 = imgs[0];
              image = i0?.url || i0?.href || i0?.source || null;
            }
          }

          const mileage = c?.vehicle?.specifics?.mileage?.['@value'] || c?.mileage?.value || c?.mileage || '';
          const firstRegistration = c?.vehicle?.specifics?.['first-registration']?.['@value'] || c?.firstRegistration || '';
          const fuel = c?.vehicle?.specifics?.fuel?.['@key'] || c?.fuel || '';
          const power = c?.vehicle?.specifics?.power?.['@value'] || c?.power || '';
          const gearbox = c?.vehicle?.specifics?.gearbox?.['@key'] || c?.gearbox || '';
          const url = c?.['detail-page']?.['@url'] || c?.detailPageUrl || c?.publicUrl || '#';

          const dealerCity = c?.seller?.address?.city?.['@value']
            || c?.seller?.address?.city
            || c?.seller?.geoData?.city
            || null;
          const dealerZip = c?.seller?.address?.['postal-code']?.['@value']
            || c?.seller?.address?.zipcode
            || c?.seller?.geoData?.zipcode
            || null;

          const latRaw = c?.seller?.location?.coordinates?.latitude?.['@value']
            || c?.seller?.location?.latitude?.['@value']
            || c?.seller?.location?.latitude
            || c?.seller?.geoData?.lat;
          const lonRaw = c?.seller?.location?.coordinates?.longitude?.['@value']
            || c?.seller?.location?.longitude?.['@value']
            || c?.seller?.location?.longitude
            || c?.seller?.geoData?.lon;
          const latNum = typeof latRaw === 'string' ? parseFloat(latRaw) : (typeof latRaw === 'number' ? latRaw : null);
          const lonNum = typeof lonRaw === 'string' ? parseFloat(lonRaw) : (typeof lonRaw === 'number' ? lonRaw : null);

          return {
            id: String(id),
            url,
            make,
            model,
            modelDescription,
            price: priceStr,
            currency,
            image,
            mileage: String(mileage),
            firstRegistration: String(firstRegistration),
            fuel: String(fuel),
            power: String(power),
            gearbox: String(gearbox),
            dealerCity,
            dealerZip,
            dealerLat: Number.isFinite(latNum as number) ? (latNum as number) : null,
            dealerLon: Number.isFinite(lonNum as number) ? (lonNum as number) : null,
          };
        });

        setCars(mappedCars);
        setFiltered(mappedCars);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCars();
  }, [mobileDeConnected, as24Connected, baseDomain, allowed, search, sort]);

  // Load filter options
  useEffect(() => {
    if (!mobileDeConnected) return;
    let cancelled = false;
    async function loadFilters() {
      try {
        setIsLoadingFilters(true);
        const makeRes = await authManager.authenticatedFetch(`${baseDomain}/api/mobilede/filters`, { headers: { Accept: 'application/json' } });
        if (makeRes.ok) {
          const d = await makeRes.json();
          if (!cancelled) setAvailableMakes(Array.isArray(d?.makes) ? d.makes : []);
        }

        const make = (searchDraft.make || search.make || '').trim();
        if (make) {
          const modelRes = await authManager.authenticatedFetch(`${baseDomain}/api/mobilede/filters?make=${encodeURIComponent(make)}`, { headers: { Accept: 'application/json' } });
          if (modelRes.ok) {
            const md = await modelRes.json();
            if (!cancelled) setAvailableModels(Array.isArray(md?.models) ? md.models : []);
          } else if (!cancelled) {
            setAvailableModels([]);
          }
        } else if (!cancelled) {
          setAvailableModels([]);
        }
      } finally {
        if (!cancelled) setIsLoadingFilters(false);
      }
    }
    loadFilters();
    return () => { cancelled = true; };
  }, [mobileDeConnected, baseDomain, searchDraft.make, search.make]);

  // Parse query params once
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const make = params.get('make') || '';
      const model = params.get('model') || '';
      const q = params.get('q') || '';
      setSearch({ make, model, q });
      setSearchDraft({ make, model, q });
    } catch {}
  }, []);

  useEffect(() => {
    const make = (search.make || '').trim().toLowerCase();
    const model = (search.model || '').trim().toLowerCase();
    const q = (search.q || '').trim().toLowerCase();
    let next = cars;
    if (make) next = next.filter(c => (c.make || '').toLowerCase().includes(make));
    if (model) next = next.filter(c => (c.model || '').toLowerCase().includes(model));
    if (q) {
      next = next.filter(c => (
        (c.modelDescription || '').toLowerCase().includes(q) ||
        (c.price || '').toLowerCase().includes(q) ||
        (c.fuel || '').toLowerCase().includes(q) ||
        (c.power || '').toLowerCase().includes(q)
      ));
    }
    setFiltered(next);
  }, [cars, search]);

  const handleBoostPost = (car: Car) => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('selected_car_for_boost', JSON.stringify(car));
      }
      router.push('/dashboard/inventory/boost');
    } catch (e) {
      alert('Failed to start boost flow.');
    }
  };

  async function openSocialPreview(car: Car) {
    try {
      setPreviewCar(car);
      setPreviewOpen(true);
      setPreviewLoading(true);
      setSelectedPlatforms({ facebook: true, instagram: true });
      // 1) fetch images for this listing from server
      const detailsRes = await authManager.authenticatedFetch(`${baseDomain}/api/mobilede/ad-details?mobile_ad_id=${encodeURIComponent(car.id)}`, { headers: { Accept: 'application/json' } });
      let images: string[] = [];
      let make = car.make;
      let model = car.model;
      let detail_url: string | undefined = car.url;
      if (detailsRes.ok) {
        const d = await detailsRes.json();
        images = Array.isArray(d?.images) ? d.images : [];
        make = d?.make || make;
        model = d?.model || model;
        detail_url = d?.detail_url || detail_url;
      }
      if (!images.length && car.image) images = [car.image];
      setPreviewImages(images);
      // default selection: first 10
      const s = new Set<number>();
      for (let i = 0; i < Math.min(10, images.length); i++) s.add(i);
      setSelectedIdxs(s);
      setAutoSelectTop10(true);
      // 2) generate caption
      const capRes = await authManager.authenticatedFetch(`${baseDomain}/api/social/generate-caption`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ make, model, language: 'de' }),
      });
      if (capRes.ok) {
        const c = await capRes.json();
        setPreviewCaption(c?.caption || `${make} ${model}`);
      } else {
        setPreviewCaption(`${make} ${model}`);
      }
    } catch (_) {
      setPreviewCaption(`${car.make} ${car.model}`);
      if (!previewImages.length && car.image) setPreviewImages([car.image]);
    } finally {
      setPreviewLoading(false);
    }
  }

  async function queuePost() {
    if (!previewCar) return;
    const images = Array.from(selectedIdxs)
      .sort((a, b) => a - b)
      .map((i) => previewImages[i])
      .filter(Boolean)
      .slice(0, 10);
    if (images.length === 0) {
      alert('Please select at least one image');
      return;
    }
    const platforms: Array<'facebook' | 'instagram'> = [];
    if (selectedPlatforms.facebook) platforms.push('facebook');
    if (selectedPlatforms.instagram) platforms.push('instagram');
    if (platforms.length === 0) {
      alert('Select at least one platform');
      return;
    }
    setPosting(true);
    try {
      for (const platform of platforms) {
        const body = {
          platform,
          mobile_ad_id: previewCar.id,
          images,
          caption: previewCaption,
          detail_url: previewCar.url,
          make: previewCar.make,
          model: previewCar.model,
        };
        const res = await authManager.authenticatedFetch(`${baseDomain}/api/social/queue-post`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e?.error || `Failed to queue ${platform}`);
        }
      }
      alert(`Queued to post on ${platforms.join(' & ')}. It will be published shortly.`);
      setPreviewOpen(false);
    } catch (e: any) {
      alert(e?.message || 'Failed to queue post');
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="p-4">
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading && <div>Loading cars...</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(car => (
          <div key={car.id} className="border p-2 rounded shadow">
            {car.image && <img src={car.image} alt={`${car.make} ${car.model}`} className="w-full h-48 object-cover" />}
            <h3 className="font-bold">{car.make} {car.model}</h3>
            <p>{car.modelDescription}</p>
            <p>{car.price} {car.currency}</p>
            <button
              className="mt-2 bg-blue-600 text-white px-2 py-1 rounded"
              onClick={() => openSocialPreview(car)}
            >
              Social Preview
            </button>
          </div>
        ))}
      </div>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} fullWidth maxWidth="md">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-semibold">Social Post Preview</div>
            <div className="flex items-center gap-3 text-sm">
              <label className="flex items-center gap-1"><input type="checkbox" checked={selectedPlatforms.facebook} onChange={(e)=>setSelectedPlatforms(p=>({ ...p, facebook: e.target.checked }))} /> Facebook</label>
              <label className="flex items-center gap-1"><input type="checkbox" checked={selectedPlatforms.instagram} onChange={(e)=>setSelectedPlatforms(p=>({ ...p, instagram: e.target.checked }))} /> Instagram</label>
            </div>
          </div>
          {previewLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border rounded p-2 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">Images ({previewImages.length})</div>
                  <div className="flex items-center gap-2 text-xs">
                    <label className="flex items-center gap-1"><input type="checkbox" checked={autoSelectTop10} onChange={(e)=>{
                      setAutoSelectTop10(e.target.checked);
                      if (e.target.checked) {
                        const s = new Set<number>();
                        for (let i = 0; i < Math.min(10, previewImages.length); i++) s.add(i);
                        setSelectedIdxs(s);
                      }
                    }} /> Auto-select top 10</label>
                    <button className="px-2 py-1 bg-gray-200 rounded" onClick={()=>{ const s=new Set<number>(); for(let i=0;i<Math.min(10, previewImages.length); i++) s.add(i); setSelectedIdxs(s); setAutoSelectTop10(true); }}>Select 10</button>
                    <button className="px-2 py-1 bg-gray-200 rounded" onClick={()=>{ setSelectedIdxs(new Set()); setAutoSelectTop10(false); }}>Clear</button>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mb-2">Selected: {selectedIdxs.size} / 10</div>
                <div className="grid grid-cols-2 gap-2 max-h-[600px] overflow-auto">
                  {previewImages.map((src, i) => {
                    const sel = selectedIdxs.has(i);
                    return (
                      <button key={i} type="button" onClick={()=>{
                        setAutoSelectTop10(false);
                        setSelectedIdxs(prev => {
                          const next = new Set(prev);
                          if (next.has(i)) { next.delete(i); return next; }
                          if (next.size >= 10) { alert('You can select up to 10 images.'); return next; }
                          next.add(i); return next;
                        });
                      }} className={`relative border rounded overflow-hidden ${sel ? 'ring-2 ring-purple-600' : ''}`}>
                        <img src={src} className="w-full h-56 object-cover" />
                        <div className={`absolute top-1 left-1 text-xs px-1.5 py-0.5 rounded ${sel ? 'bg-purple-600 text-white' : 'bg-white/80 text-gray-700'}`}>{sel ? 'Selected' : 'Tap to select'}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="border rounded p-2">
                <div className="text-sm text-gray-600 mb-1">Caption</div>
                <textarea value={previewCaption} onChange={(e)=>setPreviewCaption(e.target.value)} className="w-full border rounded p-2 h-48" />
                <div className="text-xs text-gray-500 mt-1">You can edit the caption before posting. We'll post selected images (max 10).</div>
              </div>
            </div>
          )}
          <div className="mt-4 flex items-center justify-end gap-2">
            <button onClick={() => setPreviewOpen(false)} className="px-3 py-2 rounded bg-gray-100">Cancel</button>
            <button onClick={queuePost} disabled={previewLoading || posting || previewImages.length === 0} className="px-4 py-2 rounded bg-purple-600 text-white disabled:opacity-60">{posting ? 'Queuing…' : 'Queue Post'}</button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
