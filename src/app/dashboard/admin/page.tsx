'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import AdminUserApps from '../../../components/AdminUserApps';
import authManager from '@/lib/auth';
import { useRouter } from 'next/navigation';

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      // Try to fetch users (admin-only endpoint) to verify admin access
      const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/admin/users`, {
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        setIsAdmin(true);
      } else if (res.status === 403) {
        setIsAdmin(false);
      } else {
        // Other errors (like 401) redirect to login
        router.push('/login');
        return;
      }
    } catch (error) {
      console.error('Admin access check failed:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (isAdmin === false) {
    return (
      <DashboardLayout>
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
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="opacity-90 mt-1">
                Manage user accounts and assign custom applications
              </p>
            </div>
            <div className="text-4xl">👑</div>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">Total Users</h3>
            <p className="text-3xl font-bold text-purple-600">--</p>
            <p className="text-gray-500">
              <i className="fas fa-users mr-1"></i>Active accounts
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">Custom Apps</h3>
            <p className="text-3xl font-bold text-blue-600">--</p>
            <p className="text-gray-500">
              <i className="fas fa-cubes mr-1"></i>Admin-created apps
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">Active Connections</h3>
            <p className="text-3xl font-bold text-green-600">--</p>
            <p className="text-gray-500">
              <i className="fas fa-link mr-1"></i>User integrations
            </p>
          </div>
        </div>

        {/* Admin User Apps Management */}
        <AdminUserApps />

        {/* Quick Admin Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Quick Admin Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <i className="fas fa-users text-2xl text-purple-600 mb-2"></i>
              <span className="text-sm font-medium">Manage Users</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <i className="fas fa-cubes text-2xl text-blue-600 mb-2"></i>
              <span className="text-sm font-medium">App Templates</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <i className="fas fa-chart-line text-2xl text-green-600 mb-2"></i>
              <span className="text-sm font-medium">Usage Analytics</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <i className="fas fa-cog text-2xl text-gray-600 mb-2"></i>
              <span className="text-sm font-medium">System Settings</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
