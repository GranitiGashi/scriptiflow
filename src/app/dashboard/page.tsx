'use client';
import React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import authManager from '@/lib/auth';

interface UserApp {
  id: string;
  name: string;
  icon_url: string | null;
  external_url: string;
  background_color: string;
  text_color: string;
  is_admin_created?: boolean;
  is_locked?: boolean;
}

const Dashboard: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [greeting, setGreeting] = useState('');
  const [apps, setApps] = useState<UserApp[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);
    if (storedRole === 'admin') {
      window.location.href = '/dashboard/admin';
    }

    try {
      const currentUser = authManager.getCurrentUser();
      setUser(currentUser);
      
      // Set greeting based on time of day
      const hour = new Date().getHours();
      if (hour < 12) setGreeting('Good morning');
      else if (hour < 18) setGreeting('Good afternoon');
      else setGreeting('Good evening');
    } catch {}

    // Fetch user apps
    fetchUserApps();
  }, []);

  const fetchUserApps = async () => {
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/user/apps`, {
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        setApps(data || []);
      } else {
        console.error('Failed to fetch user apps');
      }
    } catch (error) {
      console.error('Error fetching user apps:', error);
    } finally {
      setLoadingApps(false);
    }
  };

  const openApp = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.open(`https://${url}`, '_blank', 'noopener,noreferrer');
    }
  };

  const fullName = user?.full_name || user?.name || 'User';
  const firstName = fullName.split(' ')[0];

  return (
    <div className="space-y-8">
      {/* Greeting Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          {greeting}, {firstName}
        </h1>
        <p className="text-gray-500">Here's what's happening with your dealership today</p>
      </div>

      {/* Apps Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Apps</h2>
          <Link href="/dashboard/settings#integrations" className="text-sm font-medium text-gray-900 hover:text-blue-600 flex items-center gap-1">
            Manage Apps
            <i className="fas fa-arrow-right text-xs"></i>
          </Link>
        </div>
        
        {loadingApps ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : apps.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-th text-2xl text-gray-400"></i>
              </div>
              <p className="text-gray-500 mb-2">No apps configured</p>
              <p className="text-sm text-gray-400">Contact your administrator to add apps</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="grid grid-cols-7 gap-2 max-w-5xl">
              {apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => openApp(app.external_url)}
                  className="rounded-lg p-2 hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-1 group cursor-pointer"
                >
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                    style={{ 
                      backgroundColor: app.background_color,
                      color: app.text_color
                    }}
                  >
                    {app.icon_url ? (
                      <img 
                        src={app.icon_url} 
                        alt={app.name}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <i className="fas fa-link text-xl"></i>
                    )}
                  </div>
                  <span 
                    className="text-xs font-medium text-center line-clamp-1 text-gray-700"
                  >
                    {app.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Today's Highlights */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Today's Highlights</h2>
            <span className="px-2.5 py-1 bg-gray-900 text-white text-xs font-semibold rounded-full">
              0
            </span>
          </div>
          <Link href="/dashboard/calendar" className="text-sm font-medium text-gray-900 hover:text-blue-600 flex items-center gap-1">
            Calendar
            <i className="fas fa-arrow-right text-xs"></i>
          </Link>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-calendar-day text-2xl text-gray-400"></i>
            </div>
            <p className="text-gray-500 mb-2">No highlights for today</p>
            <p className="text-sm text-gray-400">Your tasks and events will appear here</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-car text-green-600"></i>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">--</div>
            <div className="text-sm text-gray-500">Active Listings</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-bullhorn text-blue-600"></i>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">--</div>
            <div className="text-sm text-gray-500">Active Campaigns</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-purple-600"></i>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">--</div>
            <div className="text-sm text-gray-500">Total Contacts</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-chart-line text-orange-600"></i>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">--</div>
            <div className="text-sm text-gray-500">Total Views</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Get Started</h2>
          <Link href="/dashboard/settings" className="text-sm font-medium text-gray-900 hover:text-blue-600 flex items-center gap-1">
            View All
            <i className="fas fa-arrow-right text-xs"></i>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/dashboard/settings#integrations" 
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <i className="fas fa-plug text-green-600"></i>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Connect Integrations</h3>
            <p className="text-sm text-gray-500">Connect mobile.de, Facebook, and more to sync your inventory</p>
          </Link>

          <Link 
            href="/dashboard/social" 
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <i className="fas fa-bullhorn text-blue-600"></i>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Create Campaign</h3>
            <p className="text-sm text-gray-500">Launch new social media ads for your vehicles</p>
          </Link>

          <Link 
            href="/dashboard/inventory" 
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <i className="fas fa-car text-purple-600"></i>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Manage Inventory</h3>
            <p className="text-sm text-gray-500">View and manage your vehicle listings</p>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-clock text-2xl text-gray-400"></i>
            </div>
            <p className="text-gray-500 mb-2">No recent activity</p>
            <p className="text-sm text-gray-400">Your recent actions will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;