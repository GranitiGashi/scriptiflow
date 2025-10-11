'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import authManager from '@/lib/auth';

interface Contact {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
}

interface Conversation {
  id: string;
  contact_id: string;
  last_message_at: string | null;
  unread_count: number;
  tag: 'Lead' | 'Customer' | 'Sold' | 'Spam' | null;
  contact?: Contact | null;
}

interface Message {
  id: string;
  direction: 'inbound' | 'outbound';
  body: string;
  created_at: string;
  is_car_related?: boolean;
  matched_car_mobile_de_id?: string | null;
}

export default function InboxPage() {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tagging, setTagging] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const loadConversations = async () => {
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/whatsapp/conversations`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        if (!activeId && data.length) setActiveId(data[0].id);
      }
    } catch {}
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/whatsapp/messages?conversation_id=${encodeURIComponent(conversationId)}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        setTimeout(() => {
          if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }, 50);
      }
    } catch {}
  };

  useEffect(() => {
    loadConversations();
    const id = setInterval(loadConversations, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!activeId) return;
    loadMessages(activeId);
  }, [activeId]);

  const handleSend = async () => {
    if (!activeId || !input.trim()) return;
    setLoading(true);
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/whatsapp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: activeId, message: input }),
      });
      if (res.ok) {
        setInput('');
        await loadMessages(activeId);
        await loadConversations();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTag = async (tag: 'Lead' | 'Customer' | 'Sold' | 'Spam') => {
    if (!activeId) return;
    setTagging(tag);
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/whatsapp/tag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: activeId, tag }),
      });
      if (res.ok) await loadConversations();
    } finally {
      setTagging('');
    }
  };

  const activeConv = useMemo(() => conversations.find(c => c.id === activeId) || null, [conversations, activeId]);

  return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-3 md:p-4 md:col-span-1">
          <h2 className="text-lg font-semibold mb-3">Conversations</h2>
          <div className="space-y-2 max-h-[70vh] overflow-auto">
            {conversations.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left p-3 rounded border ${activeId === c.id ? 'border-black bg-gray-50' : 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    {(c.contact?.first_name || c.contact?.last_name) ? `${c.contact?.first_name ?? ''} ${c.contact?.last_name ?? ''}`.trim() : (c.contact?.phone || c.contact?.email || 'Unknown')}
                  </div>
                  {c.unread_count > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{c.unread_count}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">{c.contact?.source || 'whatsapp'}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-3 md:p-4 md:col-span-2 flex flex-col">
          {activeConv ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-gray-800">
                    {(activeConv.contact?.first_name || activeConv.contact?.last_name) ? `${activeConv.contact?.first_name ?? ''} ${activeConv.contact?.last_name ?? ''}`.trim() : (activeConv.contact?.phone || activeConv.contact?.email || 'Unknown')}
                  </div>
                  <div className="text-xs text-gray-500">{activeConv.contact?.source || 'whatsapp'}</div>
                </div>
                <div className="space-x-2">
                  {(['Lead','Customer','Sold','Spam'] as const).map(t => (
                    <button key={t} onClick={() => handleTag(t)} className={`text-xs px-2 py-1 rounded border ${activeConv.tag === t ? 'bg-black text-white border-black' : 'border-gray-300'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-auto space-y-2 p-2 bg-gray-50 rounded">
                {messages.map(m => (
                  <div key={m.id} className={`max-w-[80%] p-2 rounded ${m.direction === 'outbound' ? 'ml-auto bg-green-100' : 'mr-auto bg-white border'}`}>
                    <div className="text-sm text-gray-800">{m.body}</div>
                    {m.is_car_related && (
                      <div className="text-[10px] text-green-700 mt-1">Car-related{m.matched_car_mobile_de_id ? ` (${m.matched_car_mobile_de_id})` : ''}</div>
                    )}
                    <div className="text-[10px] text-gray-400 mt-1">{new Date(m.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex">
                <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 border border-gray-300 rounded-l px-3 py-2" placeholder="Type a message..." />
                <button onClick={handleSend} disabled={loading || !input.trim()} className="bg-black text-white px-4 py-2 rounded-r disabled:opacity-50">Send</button>
              </div>
            </>
          ) : (
            <div className="text-gray-500">No conversation selected</div>
          )}
        </div>
      </div>
  );
}


