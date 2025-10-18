'use client';

import React, { useEffect, useMemo, useState } from 'react';
import authManager from '@/lib/auth';
import AdminTickets from '@/components/AdminTickets';

type Ticket = {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  users_app?: { full_name?: string | null; email?: string | null };
};

export default function AdminSupportPage() {
  const base = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError(null);
    try {
      const r = await authManager.authenticatedFetch(`${base}/api/admin/support/tickets`, { headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error('Failed to load tickets');
      const data: Ticket[] = await r.json();
      setTickets(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => {
    const map: Record<string, { user_id: string; name: string; email: string; tickets: Ticket[] }> = {};
    for (const t of tickets) {
      const key = t.user_id;
      const name = t.users_app?.full_name || 'Unknown';
      const email = t.users_app?.email || '';
      if (!map[key]) map[key] = { user_id: key, name, email, tickets: [] };
      map[key].tickets.push(t);
    }
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
  }, [tickets]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Support - All Clients</h1>
        <button onClick={load} className="text-sm text-blue-600 hover:text-blue-700">Refresh</button>
      </div>
      {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {loading ? (
        <div className="text-gray-600">Loading…</div>
      ) : grouped.length === 0 ? (
        <div className="text-gray-600">No tickets.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {grouped.map(group => (
            <div key={group.user_id} className="border rounded-xl p-4 bg-white">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-semibold text-gray-800">{group.name}</div>
                  <div className="text-xs text-gray-500">{group.email}</div>
                </div>
                <span className="text-xs text-gray-500">{group.tickets.length} tickets</span>
              </div>
              <ul className="divide-y">
                {group.tickets.map(t => (
                  <li key={t.id} className="py-2">
                    <div className="flex items-start justify-between">
                      <div className="pr-3">
                        <div className="font-medium text-gray-800">{t.subject}</div>
                        <div className="text-xs text-gray-500">{new Date(t.created_at).toLocaleString()}</div>
                        <div className="text-sm text-gray-600 line-clamp-2">{t.message}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${t.status === 'open' ? 'bg-yellow-100 text-yellow-800' : t.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{t.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Keep the detailed AdminTickets view below if you want full chat controls on the same page */}
      <div className="mt-6">
        <AdminTickets />
      </div>
    </div>
  );
}


