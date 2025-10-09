'use client';

import { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaExternalLinkAlt, FaLock } from 'react-icons/fa';
import authManager from '@/lib/auth';
import Link from 'next/link';
import { captureEvent } from '@/lib/analytics';
type UserApp = {
  id: string;
  name: string;
  icon_url: string | null;
  external_url: string;
  background_color: string;
  text_color: string;
  position: number;
  is_admin_created?: boolean;
  is_locked?: boolean;
};

type AppFormData = {
  name: string;
  icon_url: string;
  external_url: string;
  background_color: string;
  text_color: string;
};

export default function AppBoxes() {
  const [apps, setApps] = useState<UserApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingApp, setEditingApp] = useState<UserApp | null>(null);
  const [formData, setFormData] = useState<AppFormData>({
    name: '',
    icon_url: '',
    external_url: '',
    background_color: '#f3f4f6',
    text_color: '#374151',
  });

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);
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
      setLoading(false);
    }
  };

  const handleAddApp = () => {};

  const handleEditApp = (app: UserApp) => {};

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); };

  const handleDeleteApp = async (app: UserApp) => {};

  const openApp = (url: string) => {
    try { captureEvent('appbox_open', { url }); } catch {}
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.open(`https://${url}`, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Quick Access</h3>
      </div>

      {/* App Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mb-6">
        {apps.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            <FaPlus className="text-4xl mx-auto mb-4 opacity-50" />
            <p>No apps yet. <Link href="/support" className="text-blue-500 underline">Contact support to add apps.</Link></p>
          </div>
        ) : (
          apps.map((app) => (
          <div
            key={app.id}
            className="group relative"
          >
            <div
              className="flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all hover:shadow-md hover:scale-105"
              style={{
                backgroundColor: app.background_color,
                color: app.text_color,
              }}
              onClick={() => openApp(app.external_url)}
            >
              {app.icon_url ? (
                <img
                  src={app.icon_url}
                  alt={app.name}
                  className="w-8 h-8 mb-2 rounded"
                  onError={(e) => {
                    // Fallback to first letter if icon fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="w-8 h-8 mb-2 rounded flex items-center justify-center text-sm font-bold"
                style={{
                  backgroundColor: app.text_color,
                  color: app.background_color,
                  display: app.icon_url ? 'none' : 'flex',
                }}
              >
                {app.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-center leading-tight">
                {app.name}
              </span>
              <FaExternalLinkAlt className="absolute top-1 right-1 text-xs opacity-0 group-hover:opacity-50 transition-opacity" />
              
            </div>

            {/* Admin editing disabled in this grid; use admin Add Apps page */}

            {/* Admin-created tooltip */}
            {app.is_admin_created && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Admin-created (locked)
              </div>
            )}
          </div>
          ))
        )}
      </div>


      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">
              {editingApp ? 'Edit App' : 'Add New App'}
            </h4>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  App Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., mobile.de"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.external_url}
                  onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.mobile.de"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.icon_url}
                  onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.mobile.de/favicon.ico"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={formData.background_color}
                    onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Text Color
                  </label>
                  <input
                    type="color"
                    value={formData.text_color}
                    onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingApp ? 'Update' : 'Add'} App
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
