'use client';

import { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUser, FaLock } from 'react-icons/fa';
import authManager from '@/lib/auth';

type User = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
};

type UserApp = {
  id: string;
  name: string;
  icon_url: string | null;
  external_url: string;
  background_color: string;
  text_color: string;
  position: number;
  is_admin_created: boolean;
  is_locked: boolean;
};

type AppFormData = {
  name: string;
  icon_url: string;
  external_url: string;
  background_color: string;
  text_color: string;
};

export default function AdminUserApps() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userApps, setUserApps] = useState<UserApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(false);
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
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/admin/users`, {
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data || []);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserApps = async (userId: string) => {
    setAppsLoading(true);
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/admin/users/${userId}/apps`, {
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        setUserApps(data || []);
      } else {
        console.error('Failed to fetch user apps');
        setUserApps([]);
      }
    } catch (error) {
      console.error('Error fetching user apps:', error);
      setUserApps([]);
    } finally {
      setAppsLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    fetchUserApps(user.id);
  };

  const handleAddApp = () => {
    setEditingApp(null);
    setFormData({
      name: '',
      icon_url: '',
      external_url: '',
      background_color: '#f3f4f6',
      text_color: '#374151',
    });
    setShowAddForm(true);
  };

  const handleEditApp = (app: UserApp) => {
    setEditingApp(app);
    setFormData({
      name: app.name,
      icon_url: app.icon_url || '',
      external_url: app.external_url,
      background_color: app.background_color,
      text_color: app.text_color,
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.external_url || !selectedUser) {
      alert('Name, URL, and user selection are required');
      return;
    }

    try {
      const payload = formData;

      let res;
      if (editingApp) {
        res = await authManager.authenticatedFetch(
          `${baseDomain}/api/admin/users/${selectedUser.id}/apps/${editingApp.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify(payload),
          }
        );
      } else {
        res = await authManager.authenticatedFetch(
          `${baseDomain}/api/admin/users/${selectedUser.id}/apps`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify(payload),
          }
        );
      }

      if (res.ok) {
        await fetchUserApps(selectedUser.id);
        setShowAddForm(false);
        setEditingApp(null);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save app');
      }
    } catch (error) {
      console.error('Error saving app:', error);
      alert('Failed to save app');
    }
  };

  const handleDeleteApp = async (app: UserApp) => {
    if (!selectedUser || !confirm(`Are you sure you want to delete "${app.name}" for ${selectedUser.email}?`)) {
      return;
    }

    try {
      const res = await authManager.authenticatedFetch(
        `${baseDomain}/api/admin/users/${selectedUser.id}/apps/${app.id}`,
        {
          method: 'DELETE',
          headers: { Accept: 'application/json' }
        }
      );

      if (res.ok) {
        await fetchUserApps(selectedUser.id);
      } else {
        alert('Failed to delete app');
      }
    } catch (error) {
      console.error('Error deleting app:', error);
      alert('Failed to delete app');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Manage User Apps (Admin)</h3>
        <p className="text-sm text-gray-600 mt-1">
          Assign custom apps to specific users. These apps will be locked and cannot be edited by users.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Users List */}
        <div className="p-6 border-r border-gray-200">
          <h4 className="font-medium text-gray-800 mb-4 flex items-center">
            <FaUser className="mr-2" />
            Select User
          </h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedUser?.id === user.id
                    ? 'bg-blue-100 border border-blue-300'
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
                onClick={() => handleUserSelect(user)}
              >
                <div className="font-medium text-gray-900">{user.full_name || 'Unnamed User'}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Apps Management */}
        <div className="col-span-2 p-6">
          {!selectedUser ? (
            <div className="text-center text-gray-500 py-12">
              <FaUser className="text-4xl mx-auto mb-4 opacity-50" />
              <p>Select a user to manage their apps</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="font-medium text-gray-800">
                    Apps for {selectedUser.full_name || selectedUser.email}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {userApps.length} app{userApps.length !== 1 ? 's' : ''} assigned
                  </p>
                </div>
                <button
                  onClick={handleAddApp}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaPlus className="mr-2" />
                  Add App
                </button>
              </div>

              {appsLoading ? (
                <div className="animate-pulse grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {userApps.map((app) => (
                    <div
                      key={app.id}
                      className="group relative"
                    >
                      <div
                        className="flex flex-col items-center p-4 rounded-lg border transition-all hover:shadow-md"
                        style={{
                          backgroundColor: app.background_color,
                          color: app.text_color,
                        }}
                      >
                        {app.icon_url ? (
                          <img
                            src={app.icon_url}
                            alt={app.name}
                            className="w-8 h-8 mb-2 rounded"
                            onError={(e) => {
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
                        
                        {app.is_admin_created && (
                          <FaLock className="absolute top-1 right-1 text-xs opacity-60" />
                        )}
                      </div>

                      {/* Edit/Delete buttons */}
                      <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <button
                          onClick={() => handleEditApp(app)}
                          className="w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                        >
                          <FaEdit className="text-xs" />
                        </button>
                        <button
                          onClick={() => handleDeleteApp(app)}
                          className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">
              {editingApp ? 'Edit App' : 'Add New App'} for {selectedUser.email}
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

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This app will be locked and cannot be edited or deleted by the user.
                </p>
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
