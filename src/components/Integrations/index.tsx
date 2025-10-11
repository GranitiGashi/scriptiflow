'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { FaFacebook, FaInstagram, FaStripe, FaCar, FaLock, FaGoogle, FaMicrosoft } from 'react-icons/fa';
import { SiWhatsapp } from 'react-icons/si';
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import authManager from '@/lib/auth';
import { getUserTier } from '@/lib/permissions';

export default function ConnectPage() {
  const [accounts, setAccounts] = useState<{
    facebook_id: string | null;
    facebook_name: string | null;
    facebook_profile_picture: string | null;
    instagram_id: string | null;
    instagram_username: string | null;
    instagram_profile_picture: string | null;
  }>({
    facebook_id: null,
    facebook_name: null,
    facebook_profile_picture: null,
    instagram_id: null,
    instagram_username: null,
    instagram_profile_picture: null,
  });
  const [mobileDe, setMobileDe] = useState<{
    username: string | null;
    dealership_name: string | null;
    logo_url: string | null;
  }>({
    username: null,
    dealership_name: null,
    logo_url: null,
  });
  const [as24, setAS24] = useState<{ client_id: string | null }>({ client_id: null });
  const [loginUrl, setLoginUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showMobileDePopup, setShowMobileDePopup] = useState<boolean>(false);
  const [showAS24Popup, setShowAS24Popup] = useState<boolean>(false);
  const [mobileDeUsername, setMobileDeUsername] = useState<string>('');
  const [mobileDePassword, setMobileDePassword] = useState<string>('');
  const [mobileDeCompanyName, setMobileDeCompanyName] = useState<string>('');
  const [as24Username, setAs24Username] = useState<string>('');
  const [as24Password, setAs24Password] = useState<string>('');
  const [stripe, setStripe] = useState<{ connected: boolean; cardBrand: string | null; last4: string | null }>({ connected: false, cardBrand: null, last4: null });
  const [wa, setWa] = useState<{ connected: boolean; phoneNumberId: string | null }>({ connected: false, phoneNumberId: null });
  const [waOpen, setWaOpen] = useState(false);
  const [waPhoneNumberId, setWaPhoneNumberId] = useState('');
  const [waAccessToken, setWaAccessToken] = useState('');
  const [emailStatus, setEmailStatus] = useState<{ gmail: { connected: boolean; account_email?: string | null }, outlook: { connected: boolean; account_email?: string | null } }>({ gmail: { connected: false }, outlook: { connected: false } });
  const searchParams = useSearchParams();
  const router = useRouter();

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';


  // Load user ID from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      setUserId(user?.id ?? null);
      setMobileDeCompanyName(user?.company_name ?? null);
    }
  }, []);

  // Fetch social accounts, mobile.de credentials, and login URL
  useEffect(() => {
    if (!userId) return;

    async function fetchSocialStatus() {
      setLoading(true);
      setError(null);
      try {
        const res = await authManager.authenticatedFetch(`${baseDomain}/api/social-accounts?user_id=${encodeURIComponent(userId!)}`, {
          headers: {
            'Accept': 'application/json',
          },
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(`Failed to fetch social accounts: ${errorData.error || res.statusText}`);
        }
        const data = await res.json();
        setAccounts({
          facebook_id: data.facebook_id,
          facebook_name: data.facebook_name,
          facebook_profile_picture: data.facebook_profile_picture,
          instagram_id: data.instagram_id,
          instagram_username: data.instagram_username,
          instagram_profile_picture: data.instagram_profile_picture,
        });
      } catch (err: any) {
        console.error('❌ Failed to fetch social accounts', err);
        setError(err.message || 'Failed to load social accounts. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    async function fetchMobileDeStatus() {
      try {
        const token = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        if (!token) {
          throw new Error('No access token found. Please log in again.');
        }
        const res = await fetch(`${baseDomain}/api/connect-mobile-de`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-refresh-token': `${refreshToken}`,
          },
        });
        if (!res.ok) {
          const errorData = await res.json();
          if (errorData.error === 'No credentials found') {
            setMobileDe({ username: null, dealership_name: null, logo_url: null });
            return;
          }
          throw new Error(`Failed to fetch mobile.de credentials: ${errorData.error || res.statusText}`);
        }
        const data = await res.json();
        setMobileDe({
          username: data.username,
          dealership_name: data.dealership_name,
          logo_url: data.logo_url,
        });
      } catch (err: any) {
        console.error('❌ Failed to fetch mobile.de credentials', err);
        setError(err.message || 'Failed to load mobile.de credentials. Please try again.');
      }
    }

    async function fetchStripeStatus() {
      try {
        const res = await authManager.authenticatedFetch(`${baseDomain}/api/stripe/status`, {
          headers: { 'Accept': 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.connected) {
            // Fetch card details for nicer UI
            const cardRes = await authManager.authenticatedFetch(`${baseDomain}/api/payment-method`, {
              headers: { 'Accept': 'application/json' },
            });
            if (cardRes.ok) {
              const cardData = await cardRes.json();
              setStripe({
                connected: true,
                cardBrand: cardData?.card?.brand || null,
                last4: cardData?.card?.last4 || null,
              });
            } else {
              setStripe({ connected: true, cardBrand: null, last4: null });
            }
          } else {
            setStripe({ connected: false, cardBrand: null, last4: null });
          }
        } else {
          setStripe({ connected: false, cardBrand: null, last4: null });
        }
      } catch (err) {
        console.error('❌ Failed to fetch Stripe status', err);
        setStripe({ connected: false, cardBrand: null, last4: null });
      }
    }

    async function fetchLoginUrl() {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No access token found. Please log in again.');
        }
        const res = await fetch(`${baseDomain}/api/fb/login-url?user_id=${encodeURIComponent(userId!)}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(`Failed to fetch login URL: ${errorData.error || res.statusText}`);
        }
        const data = await res.json();
        setLoginUrl(data.auth_url);
      } catch (err) {
        console.error('❌ Failed to fetch login URL', err);
      }
    }

    async function fetchAS24Status() {
      try {
        const token = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        if (!token) {
          throw new Error('No access token found. Please log in again.');
        }
        const res = await fetch(`${baseDomain}/api/autoscout24/connect`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-refresh-token': `${refreshToken}`,
          },
        });
        if (!res.ok) { setAS24({ client_id: null }); return; }
        const data = await res.json();
        setAS24({ client_id: data.username || null });
      } catch (_) {
        setAS24({ client_id: null });
      }
    }

    fetchSocialStatus();
    fetchMobileDeStatus();
    fetchAS24Status();
    fetchStripeStatus();
    fetchLoginUrl();
    // Fetch WhatsApp status
    (async () => {
      try {
        const res = await authManager.authenticatedFetch(`${baseDomain}/api/whatsapp/credentials`, { headers: { 'Accept': 'application/json' } });
        if (res.ok) {
          const data = await res.json();
          setWa({ connected: true, phoneNumberId: data.waba_phone_number_id || null });
        } else {
          setWa({ connected: false, phoneNumberId: null });
        }
      } catch (_) {
        setWa({ connected: false, phoneNumberId: null });
      }
    })();
    // Email status
    (async () => {
      try {
        const res = await authManager.authenticatedFetch(`${baseDomain}/api/email/status`, { headers: { 'Accept': 'application/json' } });
        if (res.ok) {
          const data = await res.json();
          setEmailStatus({ gmail: data.gmail || { connected: false }, outlook: data.outlook || { connected: false } });
        }
      } catch (_) {}
    })();
  }, [userId, baseDomain]);

  // Handle OAuth redirect
  useEffect(() => {
    const status = searchParams.get('status');
    const message = searchParams.get('message');
    if (status === 'success') {
      setLoading(true);
      setTimeout(() => {
        async function fetchSocialStatus() {
          setLoading(true);
          setError(null);
          try {
            const token = localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refresh_token');
            if (!token) {
              throw new Error('No access token found. Please log in again.');
            }
            const res = await fetch(`${baseDomain}/api/social-accounts?user_id=${encodeURIComponent(userId!)}`, {
              headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'x-refresh-token': `${refreshToken}`,
              },
            });
            if (!res.ok) {
              const errorData = await res.json();
              throw new Error(`Failed to fetch social accounts: ${errorData.error || res.statusText}`);
            }
            const data = await res.json();
            setAccounts({
              facebook_id: data.facebook_id,
              facebook_name: data.facebook_name,
              facebook_profile_picture: data.facebook_profile_picture,
              instagram_id: data.instagram_id,
              instagram_username: data.instagram_username,
              instagram_profile_picture: data.instagram_profile_picture,
            });
          } catch (err: any) {
            console.error('❌ Failed to fetch social accounts', err);
            setError(err.message || 'Failed to load social accounts. Please try again.');
          } finally {
            setLoading(false);
          }
        }
        fetchSocialStatus();
        router.replace('/connect');
      }, 1000);
    } else if (status === 'error') {
      setError(message || 'Failed to connect social account');
      router.replace('/connect');
    }
  }, [searchParams, router, userId, baseDomain]);

  // Handle mobile.de connection
  const handleMobileDeConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      if (!token) {
        throw new Error('No access token found. Please log in again.');
      }
      const res = await fetch(`${baseDomain}/api/connect-mobile-de`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-refresh-token': `${refreshToken}`,
        },
        body: JSON.stringify({ username: mobileDeUsername, password: mobileDePassword }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to connect mobile.de: ${errorData.error || res.statusText}`);
      }
      setMobileDeUsername('');
      setMobileDePassword('');
      setShowMobileDePopup(false);
      // Refresh mobile.de status
      const statusRes = await fetch(`${baseDomain}/api/connect-mobile-de`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-refresh-token': `${refreshToken}`,
        },
      });
      if (statusRes.ok) {
        const data = await statusRes.json();
        setMobileDe({
          username: data.username,
          dealership_name: localStorage.getItem('user.company_name'),
          logo_url: data.logo_url,
        });
      }
    } catch (err: any) {
      console.error('❌ Failed to connect mobile.de', err);
      setError(err.message || 'Failed to connect mobile.de. Please try again.');
    }
  };

  // Handle mobile.de disconnection
  const handleMobileDeDisconnect = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      if (!token) {
        throw new Error('No access token found. Please log in again.');
      }
      const res = await fetch(`${baseDomain}/api/connect-mobile-de`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-refresh-token': `${refreshToken}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to disconnect mobile.de: ${errorData.error || res.statusText}`);
      }
      setMobileDe({ username: null, dealership_name: null, logo_url: null });
    } catch (err: any) {
      console.error('❌ Failed to disconnect mobile.de', err);
      setError(err.message || 'Failed to disconnect mobile.de. Please try again.');
    }
  };

  const integrations = useMemo(
    () => [
      {
        name: 'Facebook',
        description: 'Connect your Facebook Page for our agency to run ads on your behalf.',
        icon: <FaFacebook className="text-blue-600 text-4xl" />,
        href: loginUrl,
        connected: !!accounts?.facebook_id,
        nameOrUsername: accounts?.facebook_name,
        profilePicture: accounts?.facebook_profile_picture,
        bg: 'bg-blue-50 hover:bg-blue-100',
      },
      {
        name: 'Instagram',
        description: 'Connect your Instagram Business account for cross-platform advertising.',
        icon: <FaInstagram className="text-pink-500 text-4xl" />,
        href: loginUrl,
        connected: !!accounts?.instagram_id,
        nameOrUsername: accounts?.instagram_username ? `@${accounts.instagram_username}` : null,
        profilePicture: accounts?.instagram_profile_picture,
        bg: 'bg-pink-50 hover:bg-pink-100',
      },
      {
        name: 'Gmail',
        description: 'Detect car leads from your Gmail inbox and reply here.',
        icon: <FaGoogle className="text-red-600 text-4xl" />,
        href: undefined,
        connected: emailStatus.gmail.connected,
        nameOrUsername: emailStatus.gmail.account_email || null,
        profilePicture: null,
        bg: 'bg-red-50 hover:bg-red-100',
        type: 'email',
        provider: 'gmail',
      },
      {
        name: 'Outlook',
        description: 'Detect car leads from Outlook (Microsoft 365).',
        icon: <FaMicrosoft className="text-blue-700 text-4xl" />,
        href: undefined,
        connected: emailStatus.outlook.connected,
        nameOrUsername: emailStatus.outlook.account_email || null,
        profilePicture: null,
        bg: 'bg-blue-50 hover:bg-blue-100',
        type: 'email',
        provider: 'outlook',
      },
      {
        name: 'WhatsApp',
        description: 'Receive and reply to WhatsApp messages from your dashboard.',
        icon: <SiWhatsapp className="text-green-600 text-4xl" />,
        href: '#',
        connected: wa.connected,
        nameOrUsername: wa.phoneNumberId ? `Phone ID: ${wa.phoneNumberId}` : null,
        profilePicture: null,
        bg: 'bg-green-50 hover:bg-green-100',
      },
      {
        name: 'mobile.de',
        description: 'Connect your mobile.de account to manage car listings.',
        icon: <FaCar className="text-green-600 text-4xl" />,
        href: '#', // Handled by popup
        connected: !!mobileDe?.username,
        nameOrUsername: mobileDeCompanyName,
        profilePicture: mobileDe?.logo_url,
        bg: 'bg-green-50 hover:bg-green-100',
      },
      {
        name: 'AutoScout24',
        description: 'Connect your AutoScout24 account to manage car listings.',
        icon: <FaCar className="text-yellow-600 text-4xl" />,
        href: '#',
        connected: !!as24?.client_id,
        nameOrUsername: as24?.client_id || null,
        profilePicture: null,
        bg: 'bg-yellow-50 hover:bg-yellow-100',
      },
      {
        name: 'Stripe',
        description: 'Connect your Stripe account to accept payments.',
        icon: <FaStripe className="text-purple-600 text-4xl" />,
        href: '/dashboard/payments/save-card',
        connected: stripe.connected,
        nameOrUsername: stripe.connected
          ? `${stripe.cardBrand ? stripe.cardBrand.toUpperCase() : 'Card'}${stripe.last4 ? ' •••• ' + stripe.last4 : ''}`
          : null,
        profilePicture: null,
        bg: 'bg-purple-50 hover:bg-purple-100',
      },
    ],
    [loginUrl, accounts, mobileDe, stripe]
  );

  return (
    // <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Connect Your Accounts</h1>
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center max-w-2xl mx-auto">
            {error}
          </div>
        )}
        {loading ? (
          <div className="max-w-6xl mx-auto space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl shadow-sm p-6 bg-gray-100 animate-pulse h-40" />
            ))}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-10">
            {/* Inventory */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800">Inventory</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { key: 'mobilede', name: 'mobile.de', connected: !!mobileDe?.username, locked: false, icon: <FaCar className="text-green-600 text-3xl" /> },
                  { key: 'autoscout24', name: 'AutoScout24', connected: !!as24?.client_id, locked: false, icon: <FaCar className="text-yellow-600 text-3xl" /> },
                ]
                  .sort((a,b)=> (a.connected===b.connected?0:(a.connected?1:-1)))
                  .map(item => (
                    <div key={item.key} className="rounded-xl border p-5 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <div className="font-medium text-gray-800">{item.name}</div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${item.connected? 'bg-green-100 text-green-700':'bg-gray-100 text-gray-700'}`}>{item.connected? 'Connected':'Not connected'}</span>
                      </div>
                      {item.connected && (
                        <div className="mt-1 text-xs text-gray-600">
                          {item.key==='mobilede' && mobileDe?.username && (<span>Username: {mobileDe.username}</span>)}
                          {item.key==='autoscout24' && as24?.client_id && (<span>Username: {as24.client_id}</span>)}
                        </div>
                      )}
                      <div className="mt-4">
                        {!item.connected ? (
                          <button
                            className="px-3 py-1.5 bg-black text-white rounded"
                            onClick={() => item.key==='mobilede' ? setShowMobileDePopup(true) : setShowAS24Popup(true)}
                          >Connect</button>
                        ) : (
                          <button
                            className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded"
                            onClick={async()=>{
                              try {
                                if (item.key==='mobilede') {
                                  const r = await authManager.authenticatedFetch(`${baseDomain}/api/connect-mobile-de`, { method: 'DELETE' });
                                  if (r.ok) setMobileDe({ username: null, dealership_name: null, logo_url: null });
                                } else {
                                  const r = await authManager.authenticatedFetch(`${baseDomain}/api/autoscout24/connect`, { method: 'DELETE' });
                                  if (r.ok) setAS24({ client_id: null });
                                }
                              } catch {}
                            }}
                          >Disconnect</button>
                        )}
                      </div>
                    </div>
                ))}
              </div>
            </section>

            {/* Social */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800">Social</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { key: 'facebook', name: 'Facebook', connected: !!accounts?.facebook_id, icon: <FaFacebook className="text-blue-600 text-3xl" /> },
                  { key: 'instagram', name: 'Instagram', connected: !!accounts?.instagram_id, icon: <FaInstagram className="text-pink-500 text-3xl" /> },
                ]
                  .sort((a,b)=> (a.connected===b.connected?0:(a.connected?1:-1)))
                  .map(item => (
                    <div key={item.key} className="rounded-xl border p-5 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <div className="font-medium text-gray-800">{item.name}</div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${item.connected? 'bg-green-100 text-green-700':'bg-gray-100 text-gray-700'}`}>{item.connected? 'Connected':'Not connected'}</span>
                      </div>
                      {item.connected && (
                        <div className="mt-1 text-xs text-gray-600">
                          {item.key==='facebook' && accounts.facebook_name && (<span>Page: {accounts.facebook_name}</span>)}
                          {item.key==='instagram' && accounts.instagram_username && (<span>@{accounts.instagram_username}</span>)}
                        </div>
                      )}
                      <div className="mt-4">
                        {!item.connected ? (
                          <button
                            className="px-3 py-1.5 bg-black text-white rounded"
                            onClick={async()=>{ try { const r = await authManager.authenticatedFetch(`${baseDomain}/api/fb/login-url`); const d = await r.json(); if (d?.auth_url) window.location.href = d.auth_url; } catch {} }}
                          >Connect</button>
                        ) : (
                          <button className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded" onClick={async()=>{
                            try {
                              const r = await authManager.authenticatedFetch(`${baseDomain}/api/social/disconnect`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: item.key }) });
                              if (r.ok) {
                                setAccounts(s=>({
                                  facebook_id: item.key==='facebook'? null : s.facebook_id,
                                  facebook_name: item.key==='facebook'? null : s.facebook_name,
                                  facebook_profile_picture: item.key==='facebook'? null : s.facebook_profile_picture,
                                  instagram_id: item.key==='instagram'? null : s.instagram_id,
                                  instagram_username: item.key==='instagram'? null : s.instagram_username,
                                  instagram_profile_picture: item.key==='instagram'? null : s.instagram_profile_picture,
                                }));
                              }
                            } catch {}
                          }}>Disconnect</button>
                        )}
                      </div>
                    </div>
                ))}
              </div>
            </section>

            {/* Messaging & Email */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800">Messaging & Email</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(() => {
                  const tier = getUserTier();
                  const isBasic = tier === 'basic';
                  const isPremium = tier === 'premium';
                  const items = [
                    { key: 'whatsapp', name: 'WhatsApp', connected: wa.connected, locked: !isPremium, icon: <SiWhatsapp className="text-green-600 text-3xl" /> },
                    { key: 'gmail', name: 'Gmail', connected: !!emailStatus.gmail.connected, locked: isBasic, icon: <FaGoogle className="text-red-600 text-3xl" /> },
                    { key: 'outlook', name: 'Outlook', connected: !!emailStatus.outlook.connected, locked: isBasic, icon: <FaMicrosoft className="text-blue-700 text-3xl" /> },
                  ];
                  return items
                    .sort((a,b)=> (a.locked===b.locked? (a.connected===b.connected?0:(a.connected?1:-1)) : (a.locked?1:-1)))
                    .map(item => (
                      <div key={item.key} className={`rounded-xl border p-5 bg-white ${item.locked? 'opacity-60':''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {item.icon}
                            <div className="font-medium text-gray-800">{item.name}</div>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded ${item.connected? 'bg-green-100 text-green-700':'bg-gray-100 text-gray-700'}`}>{item.connected? 'Connected':'Not connected'}</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-600 min-h-[1rem]">
                          {item.locked && (item.key==='whatsapp' ? 'Premium required' : 'Pro required')}
                        </div>
                        {item.connected && (
                          <div className="mt-1 text-xs text-gray-600">
                            {item.key==='whatsapp' && wa.phoneNumberId && (<span>Phone ID: {wa.phoneNumberId}</span>)}
                            {item.key==='gmail' && emailStatus.gmail.account_email && (<span>{emailStatus.gmail.account_email}</span>)}
                            {item.key==='outlook' && emailStatus.outlook.account_email && (<span>{emailStatus.outlook.account_email}</span>)}
                          </div>
                        )}
                        <div className="mt-2">
                          {!item.connected ? (
                            <button
                              disabled={item.locked}
                              className={`px-3 py-1.5 rounded ${item.locked? 'bg-gray-300 text-gray-600 cursor-not-allowed':'bg-black text-white'}`}
                              onClick={async()=>{
                                try {
                                  if (item.key==='whatsapp') setWaOpen(true);
                                  else if (item.key==='gmail') { const r = await authManager.authenticatedFetch(`${baseDomain}/api/email/gmail/login-url`); const d = await r.json(); if (d?.auth_url) window.location.href = d.auth_url; }
                                  else if (item.key==='outlook') { const r = await authManager.authenticatedFetch(`${baseDomain}/api/email/outlook/login-url`); const d = await r.json(); if (d?.auth_url) window.location.href = d.auth_url; }
                                } catch {}
                              }}
                            >Connect</button>
                          ) : (
                            <button
                              className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded"
                              onClick={async()=>{
                                try {
                                  if (item.key==='whatsapp') { const r = await authManager.authenticatedFetch(`${baseDomain}/api/whatsapp/credentials`, { method: 'DELETE' }); if (r.ok) setWa({ connected: false, phoneNumberId: null }); }
                                  else { const r = await authManager.authenticatedFetch(`${baseDomain}/api/email/disconnect?provider=${encodeURIComponent(item.key)}`, { method: 'DELETE' }); if (r.ok) setEmailStatus(s=>({ gmail: item.key==='gmail'? { connected: false } : s.gmail, outlook: item.key==='outlook'? { connected: false } : s.outlook })); }
                                } catch {}
                              }}
                            >Disconnect</button>
                          )}
                        </div>
                      </div>
                  ));
                })()}
              </div>
            </section>

            {/* Payments */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800">Payments</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(() => {
                  const tier = getUserTier();
                  const isBasic = tier === 'basic';
                  const item = { key: 'stripe', name: 'Stripe', connected: stripe.connected, locked: isBasic, icon: <FaStripe className="text-purple-600 text-3xl" /> };
                  return (
                    <div className={`rounded-xl border p-5 bg-white ${item.locked? 'opacity-60':''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <div className="font-medium text-gray-800">{item.name}</div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${item.connected? 'bg-green-100 text-green-700':'bg-gray-100 text-gray-700'}`}>{item.connected? 'Connected':'Not connected'}</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-600 min-h-[1rem]">{item.locked && 'Pro required'}</div>
                      <div className="mt-2">
                        {!item.connected ? (
                          <button disabled={item.locked} className={`px-3 py-1.5 rounded ${item.locked? 'bg-gray-300 text-gray-600 cursor-not-allowed':'bg-black text-white'}`} onClick={()=> !item.locked && router.push('/dashboard/payments/save-card')}>Connect</button>
                        ) : (
                          <button className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded" onClick={async()=>{ try { const r = await authManager.authenticatedFetch(`${baseDomain}/api/payment-method`, { method: 'DELETE', headers: { 'Accept': 'application/json' } }); if (r.ok) setStripe({ connected: false, cardBrand: null, last4: null }); } catch {} }}>Disconnect</button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </section>
          </div>
        )}
        {showMobileDePopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Connect to mobile.de</h2>
              <form onSubmit={handleMobileDeConnect}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    value={mobileDeUsername}
                    onChange={(e) => setMobileDeUsername(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    value={mobileDePassword}
                    onChange={(e) => setMobileDePassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowMobileDePopup(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
                  >
                    Connect
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {showAS24Popup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Connect to AutoScout24</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError(null);
                  try {
                    const res = await authManager.authenticatedFetch(`${baseDomain}/api/autoscout24/connect`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ username: as24Username, password: as24Password })
                    });
                    if (!res.ok) {
                      const err = await res.json();
                      throw new Error(err.error || 'Failed to connect AutoScout24');
                    }
                    setAS24({ client_id: as24Username });
                    setAs24Username('');
                    setAs24Password('');
                    setShowAS24Popup(false);
                  } catch (e: any) {
                    setError(e.message || 'Failed to connect AutoScout24');
                  }
                }}
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    value={as24Username}
                    onChange={(e) => setAs24Username(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    value={as24Password}
                    onChange={(e) => setAs24Password(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAS24Popup(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded"
                  >
                    Connect
                  </button>
                </div>
              </form>
              <p className="text-xs text-gray-500 mt-3">
                You can find your credentials in the AutoScout24 partner portal. See API docs at
                <a className="text-blue-600 ml-1" href="https://listing-creation.api.autoscout24.com/assets/swagger/spec/index.html#/" target="_blank" rel="noreferrer">Swagger</a>.
              </p>
            </div>
          </div>
        )}
        {waOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Connect WhatsApp</h2>
              <div className="space-y-6">
                <div className="p-3 border rounded">
                  <div className="font-medium mb-2">Recommended: Auto-detect phone numbers (via Facebook login)</div>
                  <button
                    className="bg-black text-white px-4 py-2 rounded"
                    onClick={async () => {
                      try {
                        const res = await authManager.authenticatedFetch(`${baseDomain}/api/whatsapp/phone-numbers`);
                        if (!res.ok) {
                          const err = await res.json();
                          alert(err.error || 'Failed to fetch numbers. Ensure Facebook is connected.');
                          return;
                        }
                        const data = await res.json();
                        if (!Array.isArray(data) || data.length === 0) {
                          alert('No WhatsApp Business numbers found. Make sure your Business is set up.');
                          return;
                        }
                        const pick = data[0];
                        // Save credentials using discovered phone number; access token is pulled on send from FB token
                        const save = await authManager.authenticatedFetch(`${baseDomain}/api/whatsapp/connect`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ waba_phone_number_id: pick.phone_number_id, waba_business_account_id: pick.waba_business_account_id, access_token: 'fb_token_managed' })
                        });
                        if (save.ok) {
                          setWa({ connected: true, phoneNumberId: pick.phone_number_id });
                          setWaOpen(false);
                        } else {
                          const e = await save.json();
                          alert(e.error || 'Failed to save WhatsApp credentials');
                        }
                      } catch (e) {
                        alert('Failed to fetch WhatsApp numbers');
                      }
                    }}
                  >
                    Connect via Facebook
                  </button>
                </div>
                <div className="p-3 border rounded">
                  <div className="font-medium mb-2">Manual setup</div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        const res = await authManager.authenticatedFetch(`${baseDomain}/api/whatsapp/connect`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ waba_phone_number_id: waPhoneNumberId, access_token: waAccessToken }),
                        });
                        if (res.ok) {
                          setWa({ connected: true, phoneNumberId: waPhoneNumberId });
                          setWaOpen(false);
                          setWaPhoneNumberId('');
                          setWaAccessToken('');
                        } else {
                          const err = await res.json();
                          alert(err.error || 'Failed to connect');
                        }
                      } catch (e) {
                        alert('Failed to connect');
                      }
                    }}
                  >
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Phone Number ID</label>
                      <input value={waPhoneNumberId} onChange={(e) => setWaPhoneNumberId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50" required />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Access Token</label>
                      <input value={waAccessToken} onChange={(e) => setWaAccessToken(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50" required />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button type="button" onClick={() => setWaOpen(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded">Cancel</button>
                      <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded">Connect</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    // </DashboardLayout>
  );
}
