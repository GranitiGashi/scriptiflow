'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import authManager from '@/lib/auth';
import { Box, Button, Divider, TextField } from '@mui/material';

interface Lead {
  id: string;
  provider: 'gmail' | 'outlook';
  from_email: string | null;
  from_name: string | null;
  subject: string | null;
  snippet: string | null;
  received_at: string;
  thread_id: string | null;
  message_id: string | null;
}

export default function EmailInboxPage() {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/email/leads`);
      if (res.ok) setLeads(await res.json());
    } finally { setLoading(false); }
  };

  const fetchNow = async () => { setLoading(true); try { await authManager.authenticatedFetch(`${baseDomain}/api/email/fetch-now`, { method: 'POST' }); await load(); } finally { setLoading(false); } };

  useEffect(() => { load(); }, []);

  const active = leads.find(l => l.id === expandedId) || null;

  return (
    <DashboardLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ fontSize: 18, fontWeight: 600 }}>Email Inbox</Box>
          <Button variant="contained" onClick={fetchNow} disabled={loading}>{loading ? 'Fetching…' : 'Fetch Now'}</Button>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 2, height: 'calc(100vh - 140px)' }}>
          <Box sx={{ bgcolor: 'white', borderRadius: 1, boxShadow: 1, overflow: 'auto' }}>
            {leads.map((l) => (
              <Box key={l.id} onClick={() => setExpandedId(l.id)} sx={{ p: 1.5, cursor: 'pointer', bgcolor: expandedId === l.id ? '#eef2ff' : 'transparent', '&:hover': { bgcolor: '#f8fafc' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                  <Box sx={{ fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.from_name || l.from_email || 'Unknown'}</Box>
                  <Box sx={{ fontSize: 12, color: 'text.secondary' }}>{new Date(l.received_at).toLocaleString()}</Box>
                </Box>
                <Box sx={{ fontSize: 13, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.subject}</Box>
                <Box sx={{ fontSize: 12, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.snippet}</Box>
              </Box>
            ))}
            {leads.length === 0 && <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>No emails found</Box>}
          </Box>
          <Box sx={{ bgcolor: 'white', borderRadius: 1, boxShadow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {active ? (
              <>
                <Box sx={{ p: 2 }}>
                  <Box sx={{ fontSize: 14, color: 'text.secondary' }}>{active.from_name || active.from_email}</Box>
                  <Box sx={{ fontSize: 18, fontWeight: 600, mt: 0.5 }}>{active.subject}</Box>
                </Box>
                <Divider />
                <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
                  <Box sx={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>{active.snippet}</Box>
                </Box>
                <Divider />
                <Box sx={{ p: 1.5, display: 'flex', gap: 1 }}>
                  <TextField size="small" fullWidth placeholder="Reply…" value={reply} onChange={(e) => setReply(e.target.value)} />
                  <Button variant="contained" onClick={async () => { if (!reply.trim()) return; const res = await authManager.authenticatedFetch(`${baseDomain}/api/email/reply`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lead_id: active.id, message: reply.trim() }) }); if (res.ok) setReply(''); }}>Send</Button>
                </Box>
              </>
            ) : (
              <Box sx={{ p: 3, color: 'text.secondary' }}>Select an email to view</Box>
            )}
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
}


