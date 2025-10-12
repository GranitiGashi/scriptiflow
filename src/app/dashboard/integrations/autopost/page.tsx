"use client";

import { useEffect, useState } from "react";
import authManager from "@/lib/auth";
import WhatsAppEmbeddedSignup from "@/components/WhatsAppEmbeddedSignup";

type Listing = {
  mobile_ad_id: string;
  first_seen: string;
  last_seen: string;
  image_xxxl_url?: string | null;
  details?: any;
};

type Status = {
  last_sync_at: string | null;
  latest_first_seen: string | null;
  total_listings: number | null;
};

export default function MobileDeAutopostPage() {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const [status, setStatus] = useState<Status | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [stRes, liRes] = await Promise.all([
        authManager.authenticatedFetch(`${baseDomain}/api/mobilede/status`, { headers: { Accept: 'application/json' }, cache: 'no-store' }),
        authManager.authenticatedFetch(`${baseDomain}/api/mobilede/listings?limit=24`, { headers: { Accept: 'application/json' }, cache: 'no-store' }),
      ]);
      if (stRes.ok) {
        setStatus(await stRes.json());
      }
      if (liRes.ok) {
        setListings(await liRes.json());
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function syncNow() {
    setSyncing(true);
    setMessage(null);
    setError(null);
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/mobilede/sync-now`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || 'Sync failed');
      }
      const body = await res.json();
      setMessage(`Sync complete. New listings: ${body?.new_listings ?? 0}`);
      await loadData();
    } catch (e: any) {
      setError(e?.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  }

  async function testDummy() {
    setTesting(true);
    setMessage(null);
    setError(null);
    try {
      // Seed a dummy listing with sample images
      const seed = await authManager.authenticatedFetch(`${baseDomain}/api/mobilede/seed-dummy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          mobile_ad_id: `test-${Date.now()}`,
          make: 'MERCEDES-BENZ',
          model: 'C 43 AMG',
          detail_url: 'https://suchen.mobile.de/auto-inserat/mercedes-benz-c-43-amg/421256024.html',
          images: [
            'https://img.classistatic.de/api/v1/mo-prod/images/df/df91b356-a3d3-4764-b803-d91f38cfcd9c?rule=mo-1600.jpg',
            'https://img.classistatic.de/api/v1/mo-prod/images/f5/f5d00a05-e975-4272-9068-fd9af8756cb8?rule=mo-1600.jpg',
            'https://img.classistatic.de/api/v1/mo-prod/images/b7/b70949b2-1f1f-4ef3-8b73-c827324916a4?rule=mo-1600.jpg',
          ],
        }),
      });
      if (!seed.ok) {
        const body = await seed.json().catch(() => ({}));
        throw new Error(body?.error || 'Failed to seed dummy listing');
      }
      // Process queued jobs once
      const run = await authManager.authenticatedFetch(`${baseDomain}/api/social/jobs/run-once`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
      });
      const body = await run.json().catch(() => ({}));
      if (!run.ok) {
        throw new Error(body?.error || 'Failed to run jobs');
      }
      setMessage(`Dummy queued and processed. Jobs processed: ${body?.processed ?? 0}`);
      await loadData();
    } catch (e: any) {
      setError(e?.message || 'Dummy test failed');
    } finally {
      setTesting(false);
    }
  }

  function fmt(d?: string | null) {
    try { return d ? new Date(d).toLocaleString() : '—'; } catch { return '—'; }
  }

  return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">mobile.de Autopost</h1>
              <p className="text-sm text-gray-600 mt-1">Detect new listings every hour and autopost to social media.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={syncNow} disabled={syncing} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">
                {syncing ? 'Syncing…' : 'Sync now'}
              </button>
            <button onClick={testDummy} disabled={testing} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60">
              {testing ? 'Testing…' : 'Test dummy post'}
            </button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-500">Last sync</div>
              <div className="text-gray-900 font-medium">{fmt(status?.last_sync_at)}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-500">Latest detected</div>
              <div className="text-gray-900 font-medium">{fmt(status?.latest_first_seen)}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-500">Total tracked listings</div>
              <div className="text-gray-900 font-medium">{status?.total_listings ?? '—'}</div>
            </div>
          </div>
          {message && <div className="mt-3 text-green-700 text-sm">{message}</div>}
          {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent listings</h2>
            <button onClick={loadData} className="text-sm text-blue-600 hover:text-blue-700">Refresh</button>
          </div>
          {loading ? (
            <div className="text-gray-600">Loading…</div>
          ) : listings.length === 0 ? (
            <div className="text-gray-600">No listings yet. Click Sync now to fetch.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((l) => {
                const title = `${l?.details?.make ?? ''} ${l?.details?.model ?? ''}`.trim() || `Ad ${l.mobile_ad_id}`;
                const href = l?.details?.detailPageUrl || undefined;
                const img = l?.image_xxxl_url || undefined;
                return (
                  <div key={`${l.mobile_ad_id}`} className="border rounded-lg overflow-hidden">
                    {img ? (
                      <img src={img} alt={title} className="w-full h-48 object-cover bg-gray-100" />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">No image</div>
                    )}
                    <div className="p-4 space-y-2">
                      <div className="font-medium text-gray-900 line-clamp-1">{title}</div>
                      <div className="text-xs text-gray-500">First seen: {fmt(l.first_seen)} • Last seen: {fmt(l.last_seen)}</div>
                      <div className="flex gap-2">
                        {href && (
                          <a href={href} target="_blank" rel="noopener" className="text-sm text-blue-600 hover:text-blue-700">View on mobile.de</a>
                        )}
                        <span className="text-gray-300">|</span>
                        <span className="text-sm text-gray-600">Ad ID: {l.mobile_ad_id}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
  );
}


