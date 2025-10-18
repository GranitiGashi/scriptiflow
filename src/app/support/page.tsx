"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import authManager from "@/lib/auth";
import { supabaseClient as getSupabaseClient, initSupabaseSessionFromLocalStorage } from "@/lib/supabaseClient";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

interface Message {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
}

export default function SupportPage() {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "http://localhost:8080";
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);

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

  useEffect(() => {
    fetchTickets();
    // init Supabase session for realtime
    initSupabaseSessionFromLocalStorage();
    const client = getSupabaseClient();
    const subTickets = client
      .channel("client-tickets")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_tickets" }, () => {
        fetchTickets();
      })
      .subscribe();

    const subMessages = client
      .channel("client-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          ...(activeTicket?.id ? { filter: `ticket_id=eq.${activeTicket.id}` } : {}),
        },
        (payload: { new?: { ticket_id?: string; user_id?: string } }) => {
          if (activeTicket) {
            openChat(activeTicket);
            // play sound only if message is not from me
            const me = (() => {
              try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
            })();
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

  async function fetchTickets() {
    setLoading(true);
    setError(null);
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/support/tickets`, { headers: { Accept: "application/json" }, cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load tickets");
      const data: Ticket[] = await res.json();
      setTickets(data);
    } catch (e: any) {
      setError(e.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }

  async function submitTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/support/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit ticket");
      }
      setSubject("");
      setMessage("");
      await fetchTickets();
    } catch (e: any) {
      setError(e.message || "Failed to submit ticket");
    } finally {
      setSubmitting(false);
    }
  }

  async function openChat(ticket: Ticket) {
    setActiveTicket(ticket);
    setChatMessages([]);
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/support/messages?ticket_id=${encodeURIComponent(ticket.id)}`, { headers: { Accept: "application/json" }, cache: "no-store" });
      if (res.ok) {
        const data: Message[] = await res.json();
        setChatMessages(data);
      }
    } catch {}
  }

  async function sendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!activeTicket || !chatInput.trim()) return;
    try {
      const token = localStorage.getItem('access_token');
      const refresh = localStorage.getItem('refresh_token');
      const fd = new FormData();
      fd.set('ticket_id', activeTicket.id);
      fd.set('message', chatInput);
      for (const f of files.slice(0,5)) fd.append('files', f);
      const res = await fetch(`${baseDomain}/api/support/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'x-refresh-token': refresh || '' },
        body: fd,
      });
      if (res.ok) {
        setChatInput("");
        setFiles([]);
        await openChat(activeTicket);
      }
    } catch {}
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h1 className="text-2xl font-semibold mb-4">Support</h1>
          <p className="text-sm text-gray-600 mb-6">Have a question or issue? Send us a message and our team will get back to you shortly.</p>

          <form onSubmit={submitTicket} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief summary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your issue or question"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your Tickets</h2>
            <button onClick={fetchTickets} className="text-sm text-blue-600 hover:text-blue-700">Refresh</button>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
          )}
          {loading ? (
            <div className="text-gray-600">Loading...</div>
          ) : tickets.length === 0 ? (
            <div className="text-gray-600">No tickets yet.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ul className="divide-y divide-gray-200">
                {tickets.map((t) => (
                  <li key={t.id} className={`py-3 ${activeTicket?.id === t.id ? 'bg-blue-50 rounded-lg px-3 -mx-3' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{t.subject}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{t.message}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded ${t.status === 'open' ? 'bg-yellow-100 text-yellow-800' : t.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{t.status}</span>
                        <div className="text-xs text-gray-500 mt-1">{new Date(t.created_at).toLocaleString()}</div>
                        <button onClick={() => openChat(t)} className="mt-2 text-xs text-blue-600 hover:text-blue-700">Open Chat</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border rounded-lg p-4 h-full min-h-64">
                {activeTicket ? (
                  <div className="flex flex-col h-full">
                    <div className="mb-2">
                      <h3 className="font-semibold text-gray-800">Chat for: {activeTicket.subject}</h3>
                      <div className="text-xs text-gray-500">Created {new Date(activeTicket.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex-1 overflow-auto space-y-3 pr-1">
                      {chatMessages.map((m) => (
                        <div key={m.id} className="bg-gray-50 rounded p-2">
                          <div className="text-sm text-gray-800 whitespace-pre-line">{m.message}</div>
                          <div className="text-[11px] text-gray-500 mt-1">{new Date(m.created_at).toLocaleString()}</div>
                        </div>
                      ))}
                      {chatMessages.length === 0 && (
                        <div className="text-sm text-gray-500">No messages yet.</div>
                      )}
                    </div>
                    <form onSubmit={sendChat} className="mt-3 flex gap-2 items-center">
                      <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                      />
                      <label className="px-3 py-2 border rounded-lg cursor-pointer text-sm text-gray-700 bg-gray-50 hover:bg-gray-100">
                        Attach
                        <input type="file" multiple className="hidden" onChange={(e)=> setFiles(Array.from(e.target.files || []))} />
                      </label>
                      {files.length>0 && (
                        <span className="text-xs text-gray-500">{files.length} file{files.length>1?'s':''}</span>
                      )}
                      <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Send</button>
                    </form>
                  </div>
                ) : (
                  <div className="text-gray-600">Select a ticket to chat.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
