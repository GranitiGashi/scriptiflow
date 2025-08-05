'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { FaFacebook, FaInstagram, FaTiktok, FaStripe } from 'react-icons/fa';
import { useEffect, useState } from 'react';

export default function ConnectPage() {
  const [accounts, setAccounts] = useState<{ facebook_id: string | null; instagram_id: string | null } | null>(null);
  const [loginUrl, setLoginUrl] = useState<string | null>(null);
const storedUser = localStorage.getItem('user');
const user = storedUser ? JSON.parse(storedUser) : null;
const userEmail = user?.email
const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN

  console.log('user', user)
  console.log('userEmail', userEmail)

  useEffect(() => {
    async function fetchSocialStatus() {
      try {
        const res = await fetch(`${baseDomain}/api/social-accounts-by-email?email=${encodeURIComponent(userEmail)}`);
        const data = await res.json();
        setAccounts({
          facebook_id: data.facebook_id,
          instagram_id: data.instagram_id,
        });
      } catch (err) {
        console.error('Failed to fetch social accounts', err);
      }
    }

    async function fetchLoginUrl() {
      try {
        const res = await fetch(`http://localhost:8080/api/fb/login-url?user_id=${encodeURIComponent(userEmail)}`);
        const data = await res.json();
        setLoginUrl(data.auth_url);
      } catch (err) {
        console.error('Failed to fetch login URL', err);
      }
    }

    fetchSocialStatus();
    fetchLoginUrl();
  }, []);

  const integrations = [
    {
      name: 'Facebook',
      description: 'Manage and post to your Facebook Pages.',
      icon: <FaFacebook className="text-blue-600 text-3xl" />,
      href: loginUrl,
      connected: !!accounts?.facebook_id,
      bg: 'bg-blue-50',
    },
    {
      name: 'Instagram',
      description: 'Link your Instagram Business account.',
      icon: <FaInstagram className="text-pink-500 text-3xl" />,
      href: loginUrl,
      connected: !!accounts?.instagram_id,
      bg: 'bg-pink-50',
    },
    {
      name: 'TikTok',
      description: 'Connect your TikTok account.',
      icon: <FaTiktok className="text-black text-3xl" />,
      href: '/tiktok/login', // TODO: implement this later
      connected: false,
      bg: 'bg-gray-100',
    },
    {
      name: 'Stripe',
      description: 'Connect your Stripe account to accept payments.',
      icon: <FaStripe className="text-purple-600 text-3xl" />,
      href: '/stripe/connect', // TODO: implement this later
      connected: false,
      bg: 'bg-purple-50',
    },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Integrations</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className={`rounded-xl shadow-sm p-6 ${integration.bg} flex flex-col justify-between`}
            >
              <div className="flex items-center space-x-4">
                {integration.icon}
                <div>
                  <h2 className="text-lg font-semibold">{integration.name}</h2>
                  <p className="text-sm text-gray-600">{integration.description}</p>
                </div>
              </div>

              {integration.connected ? (
                <span className="mt-6 inline-block bg-green-500 text-white text-sm font-medium py-2 px-4 rounded">
                  Connected
                </span>
              ) : (
                <a
                  href={integration.href || '#'}
                  className={`mt-6 inline-block ${
                    integration.href ? 'bg-black hover:bg-opacity-80' : 'bg-gray-400 cursor-not-allowed'
                  } text-white text-sm font-medium py-2 px-4 rounded transition`}
                >
                  Connect
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
