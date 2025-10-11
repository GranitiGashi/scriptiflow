"use client";

import { useEffect, useState } from "react";
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import SaveCardForm from '@/components/SaveCardForm';
import authManager from "@/lib/auth";

export default function SettingsPage() {
  const base = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const [tab, setTab] = useState<'profile' | 'integrations' | 'exports' | 'branding' | 'plan' | 'billing'>('profile');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [cards, setCards] = useState<{ id: string; brand: string; last4: string; exp_month: number; exp_year: number }[]>([]);
  const [defaultPmId, setDefaultPmId] = useState<string | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [bg, setBg] = useState<File | null>(null);
  const [assets, setAssets] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pwdCurrent, setPwdCurrent] = useState<string>('');
  const [pwdNew, setPwdNew] = useState<string>('');
  const [pwdConfirm, setPwdConfirm] = useState<string>('');
  const [pwdSaving, setPwdSaving] = useState<boolean>(false);
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const [logoutAll, setLogoutAll] = useState<boolean>(false);

  const [profile, setProfile] = useState<{ full_name?: string; email?: string; company_name?: string; phone?: string }>({});
  const [tier, setTier] = useState<string | null>(null);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [intStatus, setIntStatus] = useState<Record<string, { connected: boolean; name?: string }>>({});

  async function load() {
    try {
      const res = await authManager.authenticatedFetch(`${base}/api/settings/assets`, { headers: { Accept: 'application/json' } });
      if (res.ok) setAssets(await res.json());
    } catch {}
    try {
      // Load profile from server
      const pr = await authManager.authenticatedFetch(`${base}/api/settings/profile`, { headers: { Accept: 'application/json' } });
      if (pr.ok) {
        const data = await pr.json();
        setProfile({ full_name: data?.full_name || '', email: data?.email || '', company_name: data?.company_name || '', phone: data?.phone || '' });
      } else {
        const userString = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        const user = userString ? JSON.parse(userString) : null;
        setProfile({ full_name: user?.full_name || '', email: user?.email || '', company_name: user?.company_name || '', phone: user?.phone || '' });
      }
      const userString2 = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const user2 = userString2 ? JSON.parse(userString2) : null;
      setTier(user2?.permissions?.tier || null);
    } catch {}
    try {
      const userString = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const user = userString ? JSON.parse(userString) : null;
      const uid = user?.id;
      const next: Record<string, { connected: boolean; name?: string }> = {};
      // mobile.de
      try {
        const r = await authManager.authenticatedFetch(`${base}/api/connect-mobile-de`, { headers: { Accept: 'application/json' } });
        next.mobilede = { connected: r.ok };
      } catch { next.mobilede = { connected: false }; }
      // autoscout24
      try {
        const r = await authManager.authenticatedFetch(`${base}/api/autoscout24/connect`, { headers: { Accept: 'application/json' } });
        if (r.ok) { const d = await r.json(); next.autoscout24 = { connected: true, name: d?.username || undefined }; } else { next.autoscout24 = { connected: false }; }
      } catch { next.autoscout24 = { connected: false }; }
      // social accounts
      try {
        if (uid) {
          const r = await authManager.authenticatedFetch(`${base}/api/social-accounts?user_id=${encodeURIComponent(uid)}`, { headers: { Accept: 'application/json' } });
          if (r.ok) { const d: any = await r.json(); next.facebook = { connected: !!d.facebook_id, name: d.facebook_name || undefined }; next.instagram = { connected: !!d.instagram_id, name: d.instagram_username || undefined }; }
        }
      } catch {}
      // whatsapp
      try {
        const r = await authManager.authenticatedFetch(`${base}/api/whatsapp/credentials`, { headers: { Accept: 'application/json' } });
        next.whatsapp = { connected: r.ok };
      } catch { next.whatsapp = { connected: false }; }
      // email
      try {
        const r = await authManager.authenticatedFetch(`${base}/api/email/status`, { headers: { Accept: 'application/json' } });
        if (r.ok) { const d: any = await r.json(); next.gmail = { connected: !!d?.gmail?.connected, name: d?.gmail?.account_email || undefined }; next.outlook = { connected: !!d?.outlook?.connected, name: d?.outlook?.account_email || undefined }; }
      } catch {}
      setIntStatus(next);
    } catch {}
    try {
      const r = await authManager.authenticatedFetch(`${base}/api/billing/invoices`, { headers: { Accept: 'application/json' } });
      if (r.ok) {
        const data = await r.json();
        setInvoices(data.invoices || []);
      }
    } catch {}
    try {
      const r = await authManager.authenticatedFetch(`${base}/api/billing/payment-methods`, { headers: { Accept: 'application/json' } });
      if (r.ok) {
        const data = await r.json();
        setCards(data.cards || []);
        setDefaultPmId(data.default_payment_method_id || null);
      }
    } catch {}
  }

  async function saveBranding() {
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

  async function changePassword() {
    setPwdSaving(true);
    setPwdMsg(null);
    try {
      if (!pwdCurrent) throw new Error('Current password is required');
      if (!pwdNew || pwdNew.length < 12) throw new Error('New password must be at least 12 characters');
      if (!/[a-z]/.test(pwdNew) || !/[A-Z]/.test(pwdNew) || !/[0-9]/.test(pwdNew) || !/[~`!@#$%^&*()_+\-={}\[\]|;:"'<>,.?/]/.test(pwdNew)) {
        throw new Error('Password must include upper, lower, number, and symbol');
      }
      if (pwdNew !== pwdConfirm) throw new Error('Passwords do not match');
      const res = await authManager.authenticatedFetch(`${base}/api/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: pwdCurrent, new_password: pwdNew, logout_all: logoutAll })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Failed to update password');
      setPwdMsg('Password updated');
      setPwdCurrent(''); setPwdNew(''); setPwdConfirm(''); setLogoutAll(false);
    } catch (e: any) {
      setPwdMsg(e?.message || 'Failed to update password');
    } finally {
      setPwdSaving(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setTab('profile')} className={`px-3 py-2 rounded ${tab==='profile'?'bg-black text-white':'bg-gray-100 text-gray-800'}`}>My Profile</button>
            <button onClick={() => setTab('integrations')} className={`px-3 py-2 rounded ${tab==='integrations'?'bg-black text-white':'bg-gray-100 text-gray-800'}`}>Integrations</button>
            <button onClick={() => setTab('exports')} className={`px-3 py-2 rounded ${tab==='exports'?'bg-black text-white':'bg-gray-100 text-gray-800'}`}>Data exports</button>
            <button onClick={() => setTab('branding')} className={`px-3 py-2 rounded ${tab==='branding'?'bg-black text-white':'bg-gray-100 text-gray-800'}`}>Branding</button>
            <button onClick={() => setTab('plan')} className={`px-3 py-2 rounded ${tab==='plan'?'bg-black text-white':'bg-gray-100 text-gray-800'}`}>Plan / Tier</button>
            <button onClick={() => setTab('billing')} className={`px-3 py-2 rounded ${tab==='billing'?'bg-black text-white':'bg-gray-100 text-gray-800'}`}>Billing</button>
          </div>
        </div>

        {tab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h1 className="text-xl font-semibold">My Profile</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your profile details and account security.</p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">Full Name</div>
                <input value={profile.full_name || ''} onChange={e=>setProfile(p=>({ ...p, full_name: e.target.value }))} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Email</div>
                <input value={profile.email || ''} onChange={e=>setProfile(p=>({ ...p, email: e.target.value }))} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Dealership Name</div>
                <input value={profile.company_name || ''} onChange={e=>setProfile(p=>({ ...p, company_name: e.target.value }))} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Phone Number</div>
                <input value={profile.phone || ''} onChange={e=>setProfile(p=>({ ...p, phone: e.target.value }))} className="w-full border rounded px-3 py-2" />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={async ()=>{
                  setProfileMsg(null);
                  try {
                    const res = await authManager.authenticatedFetch(`${base}/api/settings/profile`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(profile)
                    });
                    const body = await res.json();
                    if (!res.ok) throw new Error(body?.error || 'Failed to save profile');
                    // Update local cache
                    try {
                      const userString = localStorage.getItem('user');
                      const user = userString ? JSON.parse(userString) : {};
                      const next = { ...user, ...profile };
                      localStorage.setItem('user', JSON.stringify(next));
                    } catch {}
                    setProfileMsg('Profile saved');
                  } catch (e: any) {
                    setProfileMsg(e?.message || 'Failed to save profile');
                  }
                }}
                className="px-4 py-2 bg-black text-white rounded"
              >
                Save Profile
              </button>
              {profileMsg && (
                <div className={`mt-3 text-sm ${profileMsg.includes('saved') ? 'text-green-700' : 'text-red-600'}`}>{profileMsg}</div>
              )}
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold">Change Password</h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Current Password</div>
                  <input type="password" value={pwdCurrent} onChange={e => setPwdCurrent(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Current password" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">New Password</div>
                  <input type="password" value={pwdNew} onChange={e => setPwdNew(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="At least 8 characters" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Confirm New Password</div>
                  <input type="password" value={pwdConfirm} onChange={e => setPwdConfirm(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Re-enter new password" />
                </div>
              </div>
              <label className="mt-3 inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={logoutAll} onChange={e=>setLogoutAll(e.target.checked)} /> Log out from all devices
              </label>
              <div className="mt-4">
                <button onClick={changePassword} disabled={pwdSaving || !pwdCurrent || !pwdNew || !pwdConfirm} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60">{pwdSaving ? 'Updating…' : 'Update Password'}</button>
              </div>
              {pwdMsg && <div className={`mt-3 text-sm ${pwdMsg.includes('updated') ? 'text-green-700' : 'text-red-600'}`}>{pwdMsg}</div>}
            </div>
          </div>
        )}

        {tab === 'integrations' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold">Integrations</h2>
            <p className="text-sm text-gray-600 mt-1">Connect or disconnect your accounts.</p>
            <div className="mt-4 space-y-3">
              {[
                { name: 'mobile.de', key: 'mobilede' },
                { name: 'AutoScout24', key: 'autoscout24' },
                { name: 'Facebook', key: 'facebook' },
                { name: 'Instagram', key: 'instagram' },
                { name: 'WhatsApp', key: 'whatsapp' },
                { name: 'Email (Gmail)', key: 'gmail' },
                { name: 'Email (Outlook)', key: 'outlook' },
              ]
                .map(i => ({ ...i, connected: !!intStatus[i.key]?.connected, nameOrUsername: intStatus[i.key]?.name }))
                .sort((a, b) => (a.connected === b.connected ? 0 : (a.connected ? 1 : -1)))
                .map((i) => (
                  <div key={i.key} className="flex items-center justify-between border rounded p-3">
                    <div>
                      <div className="font-medium text-gray-800">{i.name}</div>
                      {i.nameOrUsername && i.connected && (
                        <div className="text-xs text-gray-500">{i.nameOrUsername}</div>
                      )}
                    </div>
                    <div className="space-x-2">
                      {!i.connected ? (
                        <button
                          className="px-3 py-1.5 bg-black text-white rounded"
                          onClick={async ()=>{
                            try {
                              if (i.key === 'mobilede') {
                                // open the integrations page flow? For now, prompt username/password
                                const username = prompt('mobile.de username');
                                const password = username ? prompt('mobile.de password') : null;
                                if (!username || !password) return;
                                const r = await authManager.authenticatedFetch(`${base}/api/connect-mobile-de`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
                                if (r.ok) setIntStatus(s=>({ ...s, mobilede: { connected: true, name: username } }));
                              } else if (i.key === 'autoscout24') {
                                const username = prompt('AutoScout24 username');
                                const password = username ? prompt('AutoScout24 password') : null;
                                if (!username || !password) return;
                                const r = await authManager.authenticatedFetch(`${base}/api/autoscout24/connect`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
                                if (r.ok) setIntStatus(s=>({ ...s, autoscout24: { connected: true, name: username } }));
                              } else if (i.key === 'facebook' || i.key === 'instagram') {
                                const r = await authManager.authenticatedFetch(`${base}/api/fb/login-url`);
                                const d = await r.json();
                                if (d?.auth_url) window.location.href = d.auth_url;
                              } else if (i.key === 'whatsapp') {
                                alert('Please connect WhatsApp from the Social page for now.');
                              } else if (i.key === 'gmail') {
                                const r = await authManager.authenticatedFetch(`${base}/api/email/gmail/login-url`);
                                const d = await r.json(); if (d?.auth_url) window.location.href = d.auth_url;
                              } else if (i.key === 'outlook') {
                                const r = await authManager.authenticatedFetch(`${base}/api/email/outlook/login-url`);
                                const d = await r.json(); if (d?.auth_url) window.location.href = d.auth_url;
                              }
                            } catch {}
                          }}
                        >Connect</button>
                      ) : (
                        <button
                          className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded"
                          onClick={async ()=>{
                            try {
                              if (i.key === 'mobilede') {
                                const r = await authManager.authenticatedFetch(`${base}/api/connect-mobile-de`, { method: 'DELETE' });
                                if (r.ok) setIntStatus(s=>({ ...s, mobilede: { connected: false } }));
                              } else if (i.key === 'autoscout24') {
                                const r = await authManager.authenticatedFetch(`${base}/api/autoscout24/connect`, { method: 'DELETE' });
                                if (r.ok) setIntStatus(s=>({ ...s, autoscout24: { connected: false } }));
                              } else if (i.key === 'facebook' || i.key === 'instagram') {
                                alert('Disconnect via Facebook Business settings for now.');
                              } else if (i.key === 'whatsapp') {
                                const r = await authManager.authenticatedFetch(`${base}/api/whatsapp/credentials`, { method: 'DELETE' });
                                if (r.ok) setIntStatus(s=>({ ...s, whatsapp: { connected: false } }));
                              } else if (i.key === 'gmail' || i.key === 'outlook') {
                                const r = await authManager.authenticatedFetch(`${base}/api/email/disconnect?provider=${encodeURIComponent(i.key==='gmail'?'gmail':'outlook')}`, { method: 'DELETE' });
                                if (r.ok) setIntStatus(s=>({ ...s, [i.key]: { connected: false } } as any));
                              }
                            } catch {}
                          }}
                        >Disconnect</button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {tab === 'exports' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold">Data exports</h2>
            <p className="text-sm text-gray-600 mt-1">Export your data for backup or analysis.</p>
            <div className="mt-4">
              <div className="border rounded p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800">Calendar (.csv)</div>
                  <div className="text-sm text-gray-600">Coming soon</div>
                </div>
                <button className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded cursor-not-allowed">Export</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'branding' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold">Branding</h2>
            <p className="text-sm text-gray-600 mt-1">Logo and background used across your materials.</p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded p-3">
                <div className="text-sm text-gray-600 mb-2">Dealership Logo</div>
                <div className="w-full h-48 bg-gray-50 border rounded flex items-center justify-center">
                  {assets.dealer_logo_url ? (
                    <img src={assets.dealer_logo_url} className="max-h-44 object-contain" />
                  ) : (
                    <div className="text-gray-400">No logo</div>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input type="file" accept="image/*" onChange={e => setLogo(e.target.files?.[0] || null)} />
                  {assets.dealer_logo_url && <button className="px-3 py-1.5 bg-gray-200 rounded" onClick={()=>setAssets((a: any)=>({ ...a, dealer_logo_url: null }))}>Remove</button>}
                </div>
              </div>

              <div className="border rounded p-3">
                <div className="text-sm text-gray-600 mb-2">Background Image</div>
                <div className="w-full h-48 bg-gray-50 border rounded overflow-hidden">
                  {assets.branded_template_url ? (
                    <img src={assets.branded_template_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No background</div>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input type="file" accept="image/*" onChange={e => setBg(e.target.files?.[0] || null)} />
                  {assets.branded_template_url && <button className="px-3 py-1.5 bg-gray-200 rounded" onClick={()=>setAssets((a: any)=>({ ...a, branded_template_url: null }))}>Remove</button>}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button onClick={saveBranding} disabled={saving || (!logo && !bg)} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
            </div>
            {info && <div className="mt-3 text-green-700 text-sm">{info}</div>}
            {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
          </div>
        )}

        {tab === 'plan' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold">Plan / Tier</h2>
            <p className="text-sm text-gray-600 mt-1">Your current plan and available features.</p>

            <div className="mt-4 border rounded p-4">
              <div className="font-medium text-gray-800">Current tier: {tier || 'basic'}</div>
              <ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
                <li>Inventory import (mobile.de / AutoScout24)</li>
                <li>Branding and image processing jobs</li>
                <li>Social auto-posts to Facebook/Instagram</li>
                <li>WhatsApp inbox</li>
              </ul>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Basic', features: ['Inventory view', 'Branding uploads'], cta: 'Choose Basic' },
                { name: 'Pro', features: ['Boost Ads', 'Social Auto-posts', 'WhatsApp'], cta: 'Upgrade to Pro' },
                { name: 'Premium', features: ['Everything in Pro', 'Priority support'], cta: 'Upgrade to Premium' },
              ].map((p)=> (
                <div key={p.name} className="border rounded p-4">
                  <div className="font-semibold">{p.name}</div>
                  <ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
                    {p.features.map(f=> <li key={f}>{f}</li>)}
                  </ul>
                  <button className="mt-3 px-3 py-1.5 bg-black text-white rounded">{p.cta}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'billing' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold">Billing</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your payment methods and view invoice history.</p>

            <div className="mt-6">
              <h3 className="font-medium mb-2">Saved cards</h3>
              <div className="border rounded">
                {cards.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">No saved cards. Add one below.</div>
                ) : (
                  <ul className="divide-y">
                    {cards.map((c) => (
                      <li key={c.id} className="p-3 flex items-center justify-between">
                        <div className="text-sm">
                          <div className="font-medium">{(c.brand || '').toUpperCase()} •••• {c.last4}</div>
                          <div className="text-gray-500">Exp {String(c.exp_month).padStart(2,'0')}/{String(c.exp_year).slice(-2)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {defaultPmId === c.id && (
                            <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-700">Default</span>
                          )}
                          <button
                            className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                            onClick={async ()=>{
                              try {
                                const r = await authManager.authenticatedFetch(`${base}/api/payment-method`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ payment_method_id: c.id })
                                });
                                if (r.ok) setDefaultPmId(c.id);
                              } catch {}
                            }}
                          >Make default</button>
                          <button
                            className="px-2 py-1 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100"
                            onClick={async ()=>{
                              if (!confirm('Delete this card?')) return;
                              try {
                                const r = await authManager.authenticatedFetch(`${base}/api/billing/payment-methods/${encodeURIComponent(c.id)}`, { method: 'DELETE' });
                                if (r.ok) {
                                  setCards(prev => prev.filter(x => x.id !== c.id));
                                  if (defaultPmId === c.id) setDefaultPmId(null);
                                }
                              } catch {}
                            }}
                          >Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-4">
                <Elements stripe={stripePromise}>
                  <SaveCardForm onSuccess={async()=>{
                    try {
                      const r = await authManager.authenticatedFetch(`${base}/api/billing/payment-methods`, { headers: { Accept: 'application/json' } });
                      if (r.ok) {
                        const data = await r.json();
                        setCards(data.cards || []);
                        setDefaultPmId(data.default_payment_method_id || null);
                      }
                    } catch {}
                  }} />
                </Elements>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-medium mb-2">Invoice history</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Invoice</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4 text-right">Amount</th>
                      <th className="py-2 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-500">No invoices yet</td>
                      </tr>
                    )}
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="border-b">
                        <td className="py-2 pr-4">{inv.created ? new Date(inv.created).toLocaleDateString() : '-'}</td>
                        <td className="py-2 pr-4">{inv.number || inv.id}</td>
                        <td className="py-2 pr-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs ${inv.status==='paid' || inv.paid ? 'bg-green-100 text-green-700' : inv.status==='open' ? 'bg-yellow-100 text-yellow-800' : inv.status==='uncollectible' || inv.status==='void' ? 'bg-gray-100 text-gray-700' : inv.status==='draft' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}>
                            {inv.status || (inv.paid ? 'paid' : 'unpaid')}
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-right">€{(inv.total/100).toFixed(2)}</td>
                        <td className="py-2 pr-4">
                          <div className="flex gap-2">
                            {inv.hosted_invoice_url && (
                              <a href={inv.hosted_invoice_url} target="_blank" className="text-blue-600 hover:underline">View</a>
                            )}
                            {inv.invoice_pdf && (
                              <a href={inv.invoice_pdf} target="_blank" className="text-blue-600 hover:underline">PDF</a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}


