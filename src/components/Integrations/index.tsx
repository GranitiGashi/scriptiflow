'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { FaFacebook, FaInstagram, FaTiktok, FaStripe } from 'react-icons/fa';
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

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
  const [loginUrl, setLoginUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';

  // Load user ID from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      setUserId(user?.id ?? null);
    }
  }, []);

  // Fetch social accounts and login URL
  useEffect(() => {
    if (!userId) return;

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
            'x-refresh-token': `${refreshToken}`
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
        // setError(err.message || 'Failed to initiate social login. Please try again.');
      }
    }

    fetchSocialStatus();
    fetchLoginUrl();
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
            if (!token) {
              throw new Error('No access token found. Please log in again.');
            }
            const res = await fetch(`${baseDomain}/api/social-accounts?user_id=${encodeURIComponent(userId!)}`, {
              headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
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

  const integrations = useMemo(
    () => [
      {
        name: 'Facebook',
        description: 'Manage and post to your Facebook Pages.',
        icon: <FaFacebook className="text-blue-600 text-4xl" />,
        href: loginUrl,
        connected: !!accounts?.facebook_id,
        nameOrUsername: accounts?.facebook_name,
        profilePicture: accounts?.facebook_profile_picture,
        bg: 'bg-blue-50 hover:bg-blue-100',
      },
      {
        name: 'Instagram',
        description: 'Link your Instagram Business account.',
        icon: <FaInstagram className="text-pink-500 text-4xl" />,
        href: loginUrl,
        connected: !!accounts?.instagram_id,
        nameOrUsername: accounts?.instagram_username ? `@${accounts.instagram_username}` : null,
        profilePicture: accounts?.instagram_profile_picture,
        bg: 'bg-pink-50 hover:bg-pink-100',
      },
      // {
      //   name: 'TikTok',
      //   description: 'Connect your TikTok account.',
      //   icon: <FaTiktok className="text-black text-4xl" />,
      //   href: '/tiktok/login',
      //   connected: false,
      //   nameOrUsername: null,
      //   profilePicture: null,
      //   bg: 'bg-gray-100 hover:bg-gray-200',
      // },
      {
        name: 'Stripe',
        description: 'Connect your Stripe account to accept payments.',
        icon: <FaStripe className="text-purple-600 text-4xl" />,
        href: '/stripe/connect',
        connected: false,
        nameOrUsername: null,
        profilePicture: null,
        bg: 'bg-purple-50 hover:bg-purple-100',
      },
    ],
    [loginUrl, accounts]
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Connect Your Social Accounts</h1>
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center max-w-2xl mx-auto">
            {error}
          </div>
        )}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl shadow-sm p-6 bg-gray-100 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                  </div>
                </div>
                <div className="mt-6 h-10 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className={`rounded-xl shadow-lg p-6 ${integration.bg} transition-all duration-300 transform hover:scale-105`}
              >
                <div className="flex items-center space-x-4 mb-4">
                  {integration.profilePicture && integration.connected ? (
                    <img
                      src={integration.profilePicture}
                      alt={`${integration.name} Profile`}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    integration.icon
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{integration.name}</h2>
                    <p className="text-sm text-gray-600">{integration.description}</p>
                    {integration.connected && integration.nameOrUsername && (
                      <p className="text-sm font-medium text-gray-700 mt-1">
                        Connected as: {integration.nameOrUsername}
                      </p>
                    )}
                  </div>
                </div>
                {integration.connected ? (
                  <div className="flex space-x-2">
                    <span className="flex-1 bg-green-500 text-white text-sm font-medium py-2 px-4 rounded text-center">
                      Connected
                    </span>
                    <button
                      onClick={() => alert(`Disconnect ${integration.name} not implemented yet`)}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-4 rounded transition"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <a
                    href={integration.href || '#'}
                    className={`block text-center ${integration.href ? 'bg-black hover:bg-opacity-80' : 'bg-gray-400 cursor-not-allowed'
                      } text-white text-sm font-medium py-2 px-4 rounded transition`}
                  >
                    Connect
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}