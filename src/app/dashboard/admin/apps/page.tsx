'use client';

import React, { useEffect, useState } from 'react';
// Layout now provided by app/dashboard/layout.tsx
import AdminUserApps from '@/components/AdminUserApps';
import authManager from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function AdminAppsPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  async function checkAdminAccess() {
    try {
      const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/admin/users`, {
        headers: { Accept: 'application/json' }
      });
      if (res.ok) setIsAdmin(true);
      else if (res.status === 403) setIsAdmin(false);
      else {
        router.push('/login');
        return;
      }
    } catch (e) {
      console.error(e);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  if (isAdmin === false) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You don't have admin privileges to access this page.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Add Apps</h1>
              <p className="opacity-90 mt-1">Assign custom applications to users</p>
            </div>
            <div className="text-4xl">🧩</div>
          </div>
        </div>

        <AdminUserApps />
      </div>
  );
}


