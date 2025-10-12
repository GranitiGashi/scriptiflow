'use client';

import React, { useEffect, useState } from 'react';
import authManager from '@/lib/auth';
import { supabaseClient as getSupabaseClient, initSupabaseSessionFromLocalStorage } from '@/lib/supabaseClient';

type Ticket = {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'closed' | string;
  created_at: string;
};

type Message = {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
};

export default function AdminTickets() {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  function playNotificationSound() {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  }

  async function fetchTickets() {
    setLoading(true);
    setError(null);
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/admin/support/tickets`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to load tickets');
      const data: Ticket[] = await res.json();
      setTickets(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTickets();
    // Prepare supabase session for realtime (uses anon key; RLS limits rows)
    initSupabaseSessionFromLocalStorage();
    const client = getSupabaseClient();
    const subTickets = client
      .channel('adm-tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, (payload: { eventType?: string }) => {
        fetchTickets();
        if (payload?.eventType === 'INSERT') {
          playNotificationSound();
        }
      })
      .subscribe();

    const subMessages = client
      .channel('adm-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages' }, (payload: { new?: { ticket_id?: string, user_id?: string } }) => {
        if (activeTicket && payload.new && payload.new.ticket_id === activeTicket.id) {
          // reload messages when current ticket gets a message
          openTicket(activeTicket);
          // play sound only if message is not from me
          const me = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();
          if (!me || (payload.new.user_id && payload.new.user_id !== me?.id)) {
            playNotificationSound();
          }
        }
      })
      .subscribe();

    return () => {
      client.removeChannel(subTickets);
      client.removeChannel(subMessages);
    };
  }, [activeTicket?.id]);

  async function openTicket(t: Ticket) {
    setActiveTicket(t);
    setMessages([]);
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/support/messages?ticket_id=${encodeURIComponent(t.id)}`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (res.ok) {
        const data: Message[] = await res.json();
        setMessages(data);
      }
    } catch {}
  }

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!activeTicket || !reply.trim()) return;
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/support/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ticket_id: activeTicket.id, message: reply }),
      });
      if (res.ok) {
        setReply('');
        await openTicket(activeTicket);
      }
    } catch {}
  }

  async function changeStatus(newStatus: 'open' | 'in_progress' | 'closed') {
    if (!activeTicket) return;
    setUpdatingStatus(true);
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/admin/support/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ticket_id: activeTicket.id, status: newStatus }),
      });
      if (res.ok) {
        await fetchTickets();
        const updated = tickets.find(t => t.id === activeTicket.id);
        if (updated) setActiveTicket(updated);
      }
    } catch {}
    setUpdatingStatus(false);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">All Support Tickets</h2>
        <button onClick={fetchTickets} className="text-sm text-blue-600 hover:text-blue-700">Refresh</button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : tickets.length === 0 ? (
        <div className="text-gray-600">No tickets.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ul className="divide-y divide-gray-200">
            {tickets.map((t) => (
              <li key={t.id} className={`py-3 ${activeTicket?.id === t.id ? 'bg-blue-50 rounded-lg px-3 -mx-3' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{t.subject}</p>
                    <p className="text-xs text-gray-500">User: {t.user_id}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{t.message}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded ${t.status === 'open' ? 'bg-yellow-100 text-yellow-800' : t.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{t.status}</span>
                    <div className="text-xs text-gray-500 mt-1">{new Date(t.created_at).toLocaleString()}</div>
                    <button onClick={() => openTicket(t)} className="mt-2 text-xs text-blue-600 hover:text-blue-700">Open</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="border rounded-lg p-4 h-full min-h-64">
            {activeTicket ? (
              <div className="flex flex-col h-full">
                <div className="mb-2">
                  <h3 className="font-semibold text-gray-800">{activeTicket.subject}</h3>
                  <div className="text-xs text-gray-500">Created {new Date(activeTicket.created_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-600">Status:</span>
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={activeTicket.status}
                    onChange={(e) => changeStatus(e.target.value as any)}
                    disabled={updatingStatus}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="flex-1 overflow-auto space-y-3 pr-1">
                  {messages.map((m) => (
                    <div key={m.id} className="bg-gray-50 rounded p-2">
                      <div className="text-sm text-gray-800 whitespace-pre-line">{m.message}</div>
                      <div className="text-[11px] text-gray-500 mt-1">{new Date(m.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="text-sm text-gray-500">No messages yet.</div>
                  )}
                </div>
                <form onSubmit={sendReply} className="mt-3 flex gap-2">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type a reply..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Send</button>
                </form>
              </div>
            ) : (
              <div className="text-gray-600">Select a ticket.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


