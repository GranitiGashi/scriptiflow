"use client";

import { useEffect, useState } from "react";
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import SaveCardForm from '@/components/SaveCardForm';
import authManager from "@/lib/auth";
import { FaEye, FaEyeSlash, FaCreditCard, FaFileInvoiceDollar, FaCheckCircle, FaPlus, FaTrash, FaStar, FaDownload, FaExternalLinkAlt } from "react-icons/fa";

export default function SettingsPage() {
  const base = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const [tab, setTab] = useState<'profile' | 'integrations' | 'exports' | 'branding' | 'plan' | 'payment' | 'billing'>('profile');
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
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

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
            <button onClick={() => setTab('payment')} className={`px-3 py-2 rounded ${tab==='payment'?'bg-black text-white':'bg-gray-100 text-gray-800'}`}>Payment Methods</button>
            <button onClick={() => setTab('billing')} className={`px-3 py-2 rounded ${tab==='billing'?'bg-black text-white':'bg-gray-100 text-gray-800'}`}>Billing & Invoices</button>
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
                  <div className="relative">
                    <input type={showCurrentPassword ? "text" : "password"} value={pwdCurrent} onChange={e => setPwdCurrent(e.target.value)} className="w-full border rounded px-3 py-2 pr-10" placeholder="Current password" />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                    >
                      {showCurrentPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">New Password</div>
                  <div className="relative">
                    <input type={showNewPassword ? "text" : "password"} value={pwdNew} onChange={e => setPwdNew(e.target.value)} className="w-full border rounded px-3 py-2 pr-10" placeholder="At least 8 characters" />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                    >
                      {showNewPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Confirm New Password</div>
                  <div className="relative">
                    <input type={showConfirmPassword ? "text" : "password"} value={pwdConfirm} onChange={e => setPwdConfirm(e.target.value)} className="w-full border rounded px-3 py-2 pr-10" placeholder="Re-enter new password" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                    >
                      {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
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

        {tab === 'payment' && (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-8 border border-gray-200">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
                <FaCreditCard className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
                <p className="text-sm text-gray-600">Securely manage your payment cards</p>
              </div>
            </div>

            {/* Saved Payment Methods */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaCreditCard className="text-gray-500" />
                  Your Cards
                </h3>
                {cards.length > 0 && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    {cards.length} {cards.length === 1 ? 'card' : 'cards'}
                  </span>
                )}
              </div>

              {cards.length === 0 ? (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-2xl p-12 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
                    <FaCreditCard className="text-blue-500 text-3xl" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No payment methods yet</h4>
                  <p className="text-sm text-gray-600 mb-4">Add your first payment method to start</p>
                  <div className="inline-flex items-center gap-2 text-xs text-blue-600 font-medium">
                    <FaCheckCircle />
                    <span>Secure payment processing with Stripe</span>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {cards.map((c) => (
                    <div 
                      key={c.id} 
                      className={`group relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${
                        defaultPmId === c.id ? 'ring-4 ring-green-400 ring-opacity-50' : ''
                      }`}
                    >
                      {/* Card Pattern Background */}
                      <div className="absolute inset-0 opacity-10 rounded-2xl overflow-hidden">
                        <div className="absolute inset-0" style={{
                          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)'
                        }}></div>
                      </div>

                      {/* Default Badge */}
                      {defaultPmId === c.id && (
                        <div className="absolute -top-2 -right-2 flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full text-xs font-bold shadow-lg">
                          <FaStar className="text-yellow-300" />
                          Default
                        </div>
                      )}

                      {/* Card Content */}
                      <div className="relative z-10">
                        {/* Chip Icon */}
                        <div className="mb-6">
                          <div className="w-12 h-10 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-lg shadow-md flex items-center justify-center">
                            <div className="w-8 h-6 border-2 border-yellow-600 rounded-sm"></div>
                          </div>
                        </div>

                        {/* Card Number */}
                        <div className="mb-6">
                          <p className="text-white text-lg font-mono tracking-widest">
                            •••• •••• •••• {c.last4}
                          </p>
                        </div>

                        {/* Card Details */}
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Expires</p>
                            <p className="text-white font-semibold">{String(c.exp_month).padStart(2,'0')}/{String(c.exp_year).slice(-2)}</p>
                          </div>
                          <div className="text-right">
                            <div className="px-3 py-1 bg-white bg-opacity-90 rounded text-xs font-bold text-gray-900">
                              {(c.brand || 'CARD').toUpperCase()}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex gap-2">
                          {defaultPmId !== c.id && (
                            <button
                              className="flex-1 px-3 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-xs font-semibold rounded-lg transition-all duration-200 backdrop-blur-sm flex items-center justify-center gap-2"
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
                            >
                              <FaStar className="text-xs" />
                              Set Default
                            </button>
                          )}
                          <button
                            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                            onClick={async ()=>{
                              if (!confirm('Remove this payment method?')) return;
                              try {
                                const r = await authManager.authenticatedFetch(`${base}/api/billing/payment-methods/${encodeURIComponent(c.id)}`, { method: 'DELETE' });
                                if (r.ok) {
                                  setCards(prev => prev.filter(x => x.id !== c.id));
                                  if (defaultPmId === c.id) setDefaultPmId(null);
                                }
                              } catch {}
                            }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Card Section */}
            <div className="mt-10">
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                  <div className="flex items-center gap-3 text-white">
                    <FaPlus className="text-xl" />
                    <div>
                      <h3 className="text-lg font-bold">Add New Payment Method</h3>
                      <p className="text-sm text-blue-100">Securely add a new card to your account</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gray-50">
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
              
              {/* Security Notice */}
              <div className="mt-4 flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <FaCheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-900">Your payment information is secure</p>
                  <p className="text-blue-700 mt-1">All transactions are encrypted and processed securely through Stripe. We never store your full card details.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'billing' && (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-8 border border-gray-200">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-md">
                <FaFileInvoiceDollar className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Billing & Invoices</h2>
                <p className="text-sm text-gray-600">Manage your billing and view invoice history</p>
              </div>
            </div>

            {/* Current Payment Method Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaCreditCard className="text-gray-500" />
                  Active Payment Method
                </h3>
                <button 
                  onClick={() => setTab('payment')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Manage Cards
                  <FaExternalLinkAlt className="text-xs" />
                </button>
              </div>
              
              {cards.length === 0 ? (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <svg className="h-6 w-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-amber-900 mb-1">No payment method on file</h4>
                      <p className="text-sm text-amber-800 mb-3">Add a payment method to enable automatic billing and subscription management.</p>
                      <button 
                        onClick={() => setTab('payment')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-all duration-200"
                      >
                        <FaPlus />
                        Add Payment Method
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl">
                  {/* Card Pattern Background */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)'
                    }}></div>
                  </div>

                  <div className="relative z-10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {/* Chip */}
                        <div className="w-12 h-10 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-lg shadow-md flex items-center justify-center">
                          <div className="w-8 h-6 border-2 border-yellow-600 rounded-sm"></div>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Default Payment</p>
                          <p className="text-white font-semibold text-sm">Primary Card</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500 bg-opacity-20 backdrop-blur-sm rounded-full">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-300 text-xs font-semibold">Active</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-white text-xl font-mono tracking-widest">
                        •••• •••• •••• {(cards.find(c => c.id === defaultPmId) || cards[0]).last4}
                      </p>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Expires</p>
                        <p className="text-white font-semibold">
                          {String((cards.find(c => c.id === defaultPmId) || cards[0]).exp_month).padStart(2,'0')}/{String((cards.find(c => c.id === defaultPmId) || cards[0]).exp_year).slice(-2)}
                        </p>
                      </div>
                      <div className="px-4 py-1.5 bg-white bg-opacity-90 rounded-lg">
                        <p className="text-xs font-bold text-gray-900">
                          {((cards.find(c => c.id === defaultPmId) || cards[0]).brand || 'CARD').toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Invoice History Section */}
            <div className="mt-10">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaFileInvoiceDollar className="text-gray-500" />
                  Invoice History
                </h3>
                {invoices.length > 0 && (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                    {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'}
                  </span>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
                {invoices.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                      <FaFileInvoiceDollar className="text-gray-400 text-3xl" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No invoices yet</h4>
                    <p className="text-sm text-gray-600 mb-1">Your billing history will appear here</p>
                    <p className="text-xs text-gray-500">Invoices are generated automatically when charges occur</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Invoice</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {invoices.map((inv, idx) => (
                          <tr key={inv.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600">
                                  {inv.created ? new Date(inv.created * 1000).getDate() : '-'}
                                </div>
                                <span className="text-sm text-gray-900">
                                  {inv.created ? new Date(inv.created * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '-'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                {inv.number || `#${inv.id.substring(0, 8).toUpperCase()}`}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                inv.status==='paid' || inv.paid 
                                  ? 'bg-green-100 text-green-700' 
                                  : inv.status==='open' 
                                  ? 'bg-yellow-100 text-yellow-700' 
                                  : inv.status==='uncollectible' || inv.status==='void' 
                                  ? 'bg-gray-100 text-gray-700' 
                                  : inv.status==='draft' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {(inv.status==='paid' || inv.paid) && <FaCheckCircle />}
                                {(inv.status || (inv.paid ? 'paid' : 'unpaid')).charAt(0).toUpperCase() + (inv.status || (inv.paid ? 'paid' : 'unpaid')).slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm font-bold text-gray-900">€{(inv.total/100).toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                {inv.hosted_invoice_url && (
                                  <a 
                                    href={inv.hosted_invoice_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-all duration-200"
                                  >
                                    <FaExternalLinkAlt />
                                    View
                                  </a>
                                )}
                                {inv.invoice_pdf && (
                                  <a 
                                    href={inv.invoice_pdf} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold rounded-lg transition-all duration-200"
                                  >
                                    <FaDownload />
                                    PDF
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Billing Info */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <FaCheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-900">Automatic Billing</p>
                  <p className="text-blue-700 mt-1">Your subscription is automatically billed to your default payment method.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <FaFileInvoiceDollar className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-emerald-900">Invoice Access</p>
                  <p className="text-emerald-700 mt-1">Download and view all your invoices anytime from this page.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}


