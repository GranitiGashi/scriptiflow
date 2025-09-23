'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useMemo, useState } from 'react';
import authManager from '@/lib/auth';

interface Lead {
  id: string;
  provider: 'gmail' | 'outlook';
  from_email: string | null;
  from_name: string | null;
  subject: string | null;
  snippet: string | null;
  received_at: string;
  customer_name: string | null;
  car_model: string | null;
  car_year: string | null;
  car_price: string | null;
  listing_link: string | null;
}

export default function EmailInboxPageAlias() {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  const loadLeads = async () => {
    setLoading(true);
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/email/leads`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNow = async () => {
    setLoading(true);
    try {
      await authManager.authenticatedFetch(`${baseDomain}/api/email/fetch-now`, { method: 'POST' });
      await loadLeads();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const grouped = useMemo(() => {
    const groups: Record<string, Lead[]> = { gmail: [], outlook: [] } as any;
    for (const l of leads) {
      (groups[l.provider] = groups[l.provider] || []).push(l);
    }
    return groups;
  }, [leads]);

  const handleReply = async (leadId: string) => {
    if (!replyText.trim()) return;
    setReplyingId(leadId);
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/email/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, message: replyText.trim() }),
      });
      if (res.ok) {
        setReplyText('');
        alert('Reply sent');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to send');
      }
    } catch (_) {
      alert('Failed to send');
    } finally {
      setReplyingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Email Leads</h2>
          <button onClick={fetchNow} className="bg-black text-white px-4 py-2 rounded disabled:opacity-50" disabled={loading}>
            {loading ? 'Fetching…' : 'Fetch Now'}
          </button>
        </div>

        {(['gmail','outlook'] as const).map((provider) => (
          <div key={provider} className="mb-6">
            <h3 className="text-lg font-medium mb-3 capitalize">{provider}</h3>
            <div className="bg-white rounded-md shadow divide-y">
              {(grouped[provider] || []).map((lead) => (
                <div key={lead.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{lead.customer_name || lead.from_name || lead.from_email || 'Unknown'}</div>
                      <div className="text-sm text-gray-600">{lead.subject}</div>
                      <div className="text-xs text-gray-500">{new Date(lead.received_at).toLocaleString()}</div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      {lead.car_model && (
                        <div>
                          {lead.car_model} {lead.car_year ? `(${lead.car_year})` : ''} {lead.car_price ? `- ${lead.car_price}` : ''}
                        </div>
                      )}
                      {lead.listing_link && (
                        <a href={lead.listing_link} target="_blank" className="text-blue-600 underline">Listing</a>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">{lead.snippet}</div>
                  <div className="mt-3 flex gap-2">
                    <input
                      value={replyingId === lead.id ? replyText : ''}
                      onChange={(e) => {
                        setReplyingId(lead.id);
                        setReplyText(e.target.value);
                      }}
                      placeholder="Type a reply…"
                      className="flex-1 border border-gray-300 rounded px-3 py-2"
                    />
                    <button onClick={() => handleReply(lead.id)} className="bg-black text-white px-3 py-2 rounded" disabled={replyingId === lead.id && !replyText.trim()}>
                      Reply
                    </button>
                  </div>
                </div>
              ))}
              {(!grouped[provider] || grouped[provider].length === 0) && (
                <div className="p-6 text-center text-gray-500">No leads found</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}


