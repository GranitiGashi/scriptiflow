"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import authManager from "@/lib/auth";

export default function WhatsAppDemoPage() {
  const base = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const [token, setToken] = useState("");
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [inbox, setInbox] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const [hardcoded, setHardcoded] = useState(false);
  const [phoneId, setPhoneId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function checkConnected() {
    try {
      const res = await authManager.authenticatedFetch(`${base}/api/whatsapp/credentials?demo=1`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (res.ok) {
        const body = await res.json();
        setConnected(true);
        setPhoneId(body.waba_phone_number_id || 'YOUR_PHONE_NUMBER_ID');
        setHardcoded(body.mode === 'hardcoded');
      } else {
        setConnected(false);
        setHardcoded(false);
      }
    } catch {}
  }

  async function connect() {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const res = await authManager.authenticatedFetch(`${base}/api/whatsapp/connect?demo=1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_token: token, waba_phone_number_id: phoneId || 'YOUR_PHONE_NUMBER_ID' }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || 'Failed to connect');
      }
      setConnected(true);
      setInfo('Connected (demo).');
    } catch (e: any) {
      setError(e?.message || 'Failed to connect');
    } finally {
      setLoading(false);
    }
  }

  async function loadInbox() {
    try {
      const res = await authManager.authenticatedFetch(`${base}/api/whatsapp/demo/inbox`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (res.ok) setInbox(await res.json());
    } catch {}
  }

  async function send() {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const res = await authManager.authenticatedFetch(`${base}/api/whatsapp/send?demo=1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ to, message }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || 'Failed to send');
      setInfo('Message sent. Check your WhatsApp (test recipient).');
      setMessage("");
      await loadInbox();
    } catch (e: any) {
      setError(e?.message || 'Failed to send');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkConnected();
    loadInbox();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">WhatsApp (Demo)</h1>
              <p className="text-sm text-gray-600 mt-1">Hardcoded token & phone number ID for verification. Inbox + reply.</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {!hardcoded && (
            <div className="p-4 border rounded-lg col-span-1">
              <div className="text-sm text-gray-500 mb-2">Connect WhatsApp</div>
              <input value={token} onChange={e => setToken(e.target.value)} placeholder="Paste WHATSAPP_TOKEN" className="w-full border rounded px-3 py-2 mb-2" />
              <input value={phoneId || ''} onChange={e => setPhoneId(e.target.value)} placeholder="YOUR_PHONE_NUMBER_ID" className="w-full border rounded px-3 py-2 mb-2" />
              <button onClick={connect} disabled={loading || !token} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">{loading ? 'Connecting…' : 'Connect WhatsApp'}</button>
              <div className="text-sm mt-2">Status: {connected ? 'Connected' : 'Not connected'}</div>
            </div>
            )}

            <div className={`p-4 border rounded-lg ${hardcoded ? 'col-span-3' : 'col-span-2'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500">Inbox (Demo)</div>
                <button onClick={loadInbox} className="text-sm text-blue-600">Refresh</button>
              </div>
              <div className="h-56 overflow-auto border rounded">
                {inbox.length === 0 ? (
                  <div className="p-3 text-gray-500">No messages yet. A fake inbound message is preloaded.</div>
                ) : (
                  inbox.map(m => (
                    <div key={m.id} className="p-3 border-b text-sm">
                      <div className="text-gray-800"><span className="font-medium">{m.direction === 'inbound' ? 'From' : 'To'}:</span> {m.direction === 'inbound' ? m.from : m.to}</div>
                      <div className="text-gray-700 whitespace-pre-wrap">{m.body}</div>
                      <div className="text-xs text-gray-400">{new Date(m.ts).toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2">
                <input value={to} onChange={e => setTo(e.target.value)} placeholder="Recipient phone e.g. 49176..." className="border rounded px-3 py-2 md:col-span-1" />
                <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message" className="border rounded px-3 py-2 md:col-span-2" />
                <button onClick={send} disabled={loading || !connected || !to || !message} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60">Send</button>
              </div>
            </div>
          </div>

          {info && <div className="mt-3 text-green-700 text-sm">{info}</div>}
          {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
        </div>
      </div>
    </DashboardLayout>
  );
}
