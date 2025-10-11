'use client';
import React from 'react';
import AccountSetupProgress from '../../components/AccountSetupProgress';
import DashboardCues from '../../components/DashboardCues';
import AppBoxes from '../../components/AppBoxes';
import { useEffect, useState } from 'react';
import authManager from '@/lib/auth';

const Dashboard: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);
    if (storedRole === 'admin') {
      window.location.href = '/dashboard/admin';
    }
  }, []);

  return (
      <div className="space-y-6">
        {/* Quick Access App Boxes */}
        <AppBoxes />

        {/* Account Setup Progress */}
        <AccountSetupProgress />

        {/* Dashboard Cues - What You Can Do */}
        <DashboardCues />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">Total Cars</h3>
            <p className="text-3xl font-bold text-blue-600">--</p>
            <p className="text-gray-500">
              <i className="fas fa-car mr-1"></i>Connect mobile.de to view
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">Active Campaigns</h3>
            <p className="text-3xl font-bold text-blue-600">--</p>
            <p className="text-gray-500">
              <i className="fas fa-bullhorn mr-1"></i>Connect social media to start
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">Ad Spend (This Month)</h3>
            <p className="text-3xl font-bold text-blue-600">€--</p>
            <p className="text-gray-500">
              <i className="fas fa-euro-sign mr-1"></i>Setup payments to track
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/dashboard/inventory"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-car text-2xl text-green-600 mb-2"></i>
              <span className="text-sm font-medium">View Inventory</span>
            </a>
            <a
              href="/dashboard/social-media"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-bullhorn text-2xl text-orange-600 mb-2"></i>
              <span className="text-sm font-medium">Manage Ads</span>
            </a>
            <a
              href="/dashboard/integrations"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-link text-2xl text-blue-600 mb-2"></i>
              <span className="text-sm font-medium">Connections</span>
            </a>
            <a
              href="/stripe/connect"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-credit-card text-2xl text-purple-600 mb-2"></i>
              <span className="text-sm font-medium">Payments</span>
            </a>
          </div>
        </div>
      </div>
  );
};

export default Dashboard;