'use client';

import React, { useEffect, useMemo, useState } from 'react';
import authManager from '@/lib/auth';

type User = {
  id: string;
  email: string;
  full_name?: string | null;
  company_name?: string | null;
  role: string;
};

type App = {
  id: string;
  name: string;
  icon_url?: string | null;
  external_url: string;
  background_color?: string | null;
  text_color?: string | null;
};

export default function AdminUserApps() {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [apps, setApps] = useState<App[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<{ name: string; icon_url: string; external_url: string; background_color: string; text_color: string }>(
    { name: '', icon_url: '', external_url: '', background_color: '#f3f4f6', text_color: '#111827' }
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setApps([]);
      return;
    }
    fetchApps(selectedUserId);
  }, [selectedUserId]);

  async function fetchUsers() {
    setLoadingUsers(true);
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/admin/users`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load users');
      const data: User[] = await res.json();
      setUsers(data);
      if (data.length > 0) setSelectedUserId(data[0].id);
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  }

  async function fetchApps(userId: string) {
    setLoadingApps(true);
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/admin/user-apps?user_id=${encodeURIComponent(userId)}`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load apps');
      const data: App[] = await res.json();
      setApps(data);
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Failed to load apps');
    } finally {
      setLoadingApps(false);
    }
  }

  async function addApp(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserId) return;
    if (!form.name || !form.external_url) {
      alert('Name and URL are required');
      return;
    }
    setSaving(true);
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/admin/user-apps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ user_id: selectedUserId, ...form }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create app');
      }
      setForm({ name: '', icon_url: '', external_url: '', background_color: '#f3f4f6', text_color: '#111827' });
      await fetchApps(selectedUserId);
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Failed to create app');
    } finally {
      setSaving(false);
    }
  }

  async function deleteApp(appId: string) {
    if (!confirm('Delete this app?')) return;
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/admin/user-apps/${appId}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete app');
      }
      await fetchApps(selectedUserId);
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Failed to delete app');
    }
  }

  const selectedUser = useMemo(() => users.find(u => u.id === selectedUserId) || null, [users, selectedUserId]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Assign Apps to Users</h3>

      {/* User Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          disabled={loadingUsers}
        >
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.full_name || u.email} {u.company_name ? `- ${u.company_name}` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Current Apps */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Current Apps {selectedUser ? `for ${selectedUser.full_name || selectedUser.email}` : ''}</h4>
        {loadingApps ? (
          <div className="text-gray-500">Loading apps...</div>
        ) : apps.length === 0 ? (
          <div className="text-gray-500">No apps assigned yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {apps.map(a => (
              <div key={a.id} className="flex items-center justify-between border rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  {a.icon_url ? (
                    <img src={a.icon_url} alt={a.name} className="w-6 h-6 rounded" />
                  ) : (
                    <div className="w-6 h-6 rounded bg-gray-800 text-white text-xs flex items-center justify-center">
                      {a.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-sm">{a.name}</div>
                    <a href={a.external_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600">
                      {a.external_url}
                    </a>
                  </div>
                </div>
                <button className="text-red-600 text-sm" onClick={() => deleteApp(a.id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add App Form */}
      <form onSubmit={addApp} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">App Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="e.g., Facebook"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
            <input
              type="url"
              value={form.external_url}
              onChange={(e) => setForm({ ...form, external_url: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="https://www.facebook.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon URL (optional)</label>
            <input
              type="url"
              value={form.icon_url}
              onChange={(e) => setForm({ ...form, icon_url: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="https://facebook.com/favicon.ico"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
              <input
                type="color"
                value={form.background_color}
                onChange={(e) => setForm({ ...form, background_color: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
              <input
                type="color"
                value={form.text_color}
                onChange={(e) => setForm({ ...form, text_color: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || !selectedUserId}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Add App'}
          </button>
        </div>
      </form>
    </div>
  );
}


