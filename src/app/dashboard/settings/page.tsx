"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import authManager from "@/lib/auth";

export default function SettingsPage() {
  const base = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const [logo, setLogo] = useState<File | null>(null);
  const [bg, setBg] = useState<File | null>(null);
  const [assets, setAssets] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function load() {
    try {
      const res = await authManager.authenticatedFetch(`${base}/api/settings/assets`, { headers: { Accept: 'application/json' } });
      if (res.ok) setAssets(await res.json());
    } catch {}
  }

  async function save() {
    setSaving(true);
    setError(null);
    setInfo(null);
    try {
      const fd = new FormData();
      if (logo) fd.append('logo', logo);
      if (bg) fd.append('background', bg);
      const res = await authManager.authenticatedFetch(`${base}/api/settings/assets`, { method: 'POST', body: fd } as any);
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Failed to save');
      setAssets({ ...assets, ...body });
      setInfo('Saved');
      setLogo(null); setBg(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h1 className="text-xl font-semibold">Account Settings</h1>
          <p className="text-sm text-gray-600 mt-1">Manage dealership logo and background image used by Background Remover.</p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Dealership Logo</div>
              {assets.dealer_logo_url ? (
                <img src={assets.dealer_logo_url} className="w-40 h-40 object-contain border rounded bg-white" />
              ) : (
                <div className="w-40 h-40 bg-gray-100 flex items-center justify-center text-gray-400 border rounded">No logo</div>
              )}
              <input type="file" accept="image/*" className="mt-2" onChange={e => setLogo(e.target.files?.[0] || null)} />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Background Image</div>
              {assets.branded_template_url ? (
                <img src={assets.branded_template_url} className="w-64 h-40 object-cover border rounded" />
              ) : (
                <div className="w-64 h-40 bg-gray-100 flex items-center justify-center text-gray-400 border rounded">No background</div>
              )}
              <input type="file" accept="image/*" className="mt-2" onChange={e => setBg(e.target.files?.[0] || null)} />
            </div>
          </div>

          <div className="mt-4">
            <button onClick={save} disabled={saving || (!logo && !bg)} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
          </div>

          {info && <div className="mt-3 text-green-700 text-sm">{info}</div>}
          {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
        </div>
      </div>
    </DashboardLayout>
  );
}


