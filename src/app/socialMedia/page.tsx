'use client';

import DashboardLayout from '@/components/DashboardLayout';
import React from 'react';


export default function ConnectPage() {
  return (
    <DashboardLayout>
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-8">Connect Your Social Accounts</h1>
      <div className="space-x-6">
        <a
          href="/fb/login"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded shadow"
        >
          Connect with Facebook
        </a>
        <a
          href="/tiktok/login"
          className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded shadow"
        >
          Connect with TikTok
        </a>
      </div>
    </div>
    </DashboardLayout>
  );
}
