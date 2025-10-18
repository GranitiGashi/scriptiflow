'use client';

import React, { useEffect, useState, useRef } from 'react';
import authManager from '@/lib/auth';
import { supabaseClient as getSupabaseClient, initSupabaseSessionFromLocalStorage } from '@/lib/supabaseClient';

type Ticket = {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'closed' | string;
  created_at: string;
  unread_count?: number;
  users_app?: { full_name?: string | null; email?: string | null };
};

type Message = {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  attachments?: Array<{ name: string; mime: string; size: number; url: string; path: string }> | null;
};

export default function AdminTickets() {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          ...(activeTicket?.id ? { filter: `ticket_id=eq.${activeTicket.id}` } : {}),
        },
        (payload: { new?: { ticket_id?: string, user_id?: string } }) => {
          if (activeTicket) {
            // reload messages when current ticket gets a message
            openTicket(activeTicket);
            // play sound only if message is not from me
            const me = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();
            if (!me || (payload.new?.user_id && payload.new.user_id !== me?.id)) {
              playNotificationSound();
            }
          }
        }
      )
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
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch {}
  }

  useEffect(() => {
    if (messages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!activeTicket || (!reply.trim() && files.length === 0)) return;
    try {
      const token = localStorage.getItem('access_token');
      const refresh = localStorage.getItem('refresh_token');
      const fd = new FormData();
      fd.set('ticket_id', activeTicket.id);
      fd.set('message', reply || '(attachment)');
      for (const f of files.slice(0,5)) fd.append('files', f);
      const res = await fetch(`${baseDomain}/api/support/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'x-refresh-token': refresh || '' },
        body: fd,
      });
      if (res.ok) {
        setReply('');
        setFiles([]);
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
          <div className="border rounded-lg p-4 max-h-[600px] overflow-auto">
            <ul className="divide-y divide-gray-200">
              {tickets.map((t) => (
                <li key={t.id} className={`py-3 ${activeTicket?.id === t.id ? 'bg-blue-50 rounded-lg px-3 -mx-3' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium text-gray-900">{t.subject}</p>
                        <p className="text-xs text-gray-500">
                          {t.users_app?.full_name || 'Unknown'} ({t.users_app?.email || t.user_id})
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">{t.message}</p>
                      </div>
                      {(t.unread_count || 0) > 0 && (
                        <span className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                          {t.unread_count}
                        </span>
                      )}
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
          </div>
          <div className="border rounded-lg p-4 h-[600px] flex flex-col">
            {activeTicket ? (
              <>
                <div className="mb-3 pb-3 border-b">
                  <h3 className="font-semibold text-gray-800">{activeTicket.subject}</h3>
                  <div className="text-xs text-gray-500">Created {new Date(activeTicket.created_at).toLocaleString()}</div>
                  <div className="flex items-center gap-2 mt-2">
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
                </div>
                <div className="flex-1 overflow-auto space-y-3 pr-2 mb-3">
                  {messages.map((m) => {
                    const me = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();
                    const isMe = me && m.user_id === me.id;
                    return (
                      <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-lg px-3 py-2 ${isMe ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                          {m.message !== '(attachment)' && (
                            <div className="text-sm whitespace-pre-line break-words">{m.message}</div>
                          )}
                          {m.attachments && m.attachments.length > 0 && (
                            <div className={m.message !== '(attachment)' ? 'mt-2 space-y-2' : 'space-y-2'}>
                              {m.attachments.map((att, idx) => {
                                const isImage = att.mime.startsWith('image/');
                                return (
                                  <div key={idx}>
                                    {isImage ? (
                                      <a href={att.url} target="_blank" rel="noopener noreferrer">
                                        <img src={att.url} alt={att.name} className="max-w-full rounded border border-white/20" />
                                      </a>
                                    ) : (
                                      <a href={att.url} target="_blank" rel="noopener noreferrer" className={`text-xs underline ${isMe ? 'text-green-100' : 'text-blue-600'}`}>
                                        📎 {att.name} ({(att.size / 1024).toFixed(1)} KB)
                                      </a>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          <div className={`text-[10px] mt-1 ${isMe ? 'text-green-100' : 'text-gray-500'}`}>{new Date(m.created_at).toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })}
                  {messages.length === 0 && (
                    <div className="text-sm text-gray-500">No messages yet.</div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="pt-3 border-t">
                  {files.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {files.map((file, idx) => {
                        const isImage = file.type.startsWith('image/');
                        const preview = isImage ? URL.createObjectURL(file) : null;
                        return (
                          <div key={idx} className="relative bg-gray-100 rounded p-1">
                            {isImage && preview ? (
                              <img src={preview} alt={file.name} className="h-16 w-16 object-cover rounded" />
                            ) : (
                              <div className="h-16 w-16 flex items-center justify-center text-2xl">📎</div>
                            )}
                            <button type="button" onClick={() => setFiles(files.filter((_, i) => i !== idx))} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700">×</button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <form onSubmit={sendReply} className="flex gap-2 items-center">
                    <input
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Type a reply..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <label className="px-3 py-2 border rounded-lg cursor-pointer text-sm text-gray-700 bg-gray-50 hover:bg-gray-100">
                      📎
                      <input type="file" multiple className="hidden" onChange={(e)=> setFiles(Array.from(e.target.files || []))} />
                    </label>
                    <button type="submit" disabled={!reply.trim() && files.length === 0} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm">Send</button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">Select a ticket to start chatting</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


