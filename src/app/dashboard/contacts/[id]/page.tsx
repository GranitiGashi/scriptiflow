'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import authManager from '@/lib/auth';
import { Avatar, Box, Button, Card, CardContent, Divider, Tab, Tabs, TextField, Typography } from '@mui/material';

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const [data, setData] = useState<any>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/contacts/${id}`);
      if (res.ok) setData(await res.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { if (id) load(); }, [id]);

  const initials = useMemo(() => {
    const n = `${data?.contact?.first_name || ''} ${data?.contact?.last_name || ''}`.trim();
    return n ? n.split(' ').map((p: string) => p.slice(0,1)).join('').slice(0,2).toUpperCase() : (data?.contact?.email?.slice(0,1)?.toUpperCase() || '?');
  }, [data]);

  const addNote = async () => {
    if (!note.trim()) return;
    const res = await authManager.authenticatedFetch(`${baseDomain}/api/contacts/${id}/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body: note.trim() }) });
    if (res.ok) { setNote(''); await load(); }
  };

  const [tab, setTab] = useState(0);

  return (
    <DashboardLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb', p: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Avatar sx={{ width: 72, height: 72, mx: 'auto' }}>{initials}</Avatar>
          <Typography variant="h5" sx={{ mt: 1 }}>{[data?.contact?.first_name, data?.contact?.last_name].filter(Boolean).join(' ') || 'Contact'}</Typography>
          <Typography variant="body2" color="text.secondary">{data?.contact?.email || '—'} • {data?.contact?.phone || '—'}</Typography>
          <Typography variant="caption" color="text.secondary">Source: {data?.contact?.source || '—'}</Typography>
        </Box>
        <Card>
          <CardContent>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
              <Tab label="Upcoming" />
              <Tab label="Past" />
              <Tab label="Emails" />
              <Tab label="Notes" />
            </Tabs>
            <Divider sx={{ mb: 2 }} />
            {tab === 0 && (
              <Box sx={{ display: 'grid', gap: 1 }}>
                {(data?.upcoming || []).map((ev: any) => (
                  <Card key={ev.id} variant="outlined"><CardContent><Typography variant="subtitle2">{ev.title}</Typography><Typography variant="body2" color="text.secondary">{new Date(ev.start_time).toLocaleString()} - {new Date(ev.end_time).toLocaleString()}</Typography>{ev.car_mobile_de_id && <Typography variant="caption">Car: {ev.car_mobile_de_id}</Typography>}</CardContent></Card>
                ))}
                {(!data?.upcoming || data.upcoming.length === 0) && <Typography variant="body2" color="text.secondary">No upcoming events.</Typography>}
              </Box>
            )}
            {tab === 1 && (
              <Box sx={{ display: 'grid', gap: 1 }}>
                {(data?.history || []).map((ev: any) => (
                  <Card key={ev.id} variant="outlined"><CardContent><Typography variant="subtitle2">{ev.title}</Typography><Typography variant="body2" color="text.secondary">{new Date(ev.start_time).toLocaleString()} - {new Date(ev.end_time).toLocaleString()}</Typography>{ev.car_mobile_de_id && <Typography variant="caption">Car: {ev.car_mobile_de_id}</Typography>}</CardContent></Card>
                ))}
                {(!data?.history || data.history.length === 0) && <Typography variant="body2" color="text.secondary">No past events.</Typography>}
              </Box>
            )}
            {tab === 2 && (
              <Box sx={{ display: 'grid', gap: 1 }}>
                {(data?.emails || []).map((em: any) => (
                  <Card key={em.id} variant="outlined"><CardContent><Typography variant="subtitle2">{em.subject || '(no subject)'}</Typography><Typography variant="caption" color="text.secondary">{new Date(em.received_at).toLocaleString()} • {em.provider}</Typography><Typography variant="body2" sx={{ mt: 0.5 }}>{em.snippet}</Typography></CardContent></Card>
                ))}
                {(!data?.emails || data.emails.length === 0) && <Typography variant="body2" color="text.secondary">No emails found.</Typography>}
              </Box>
            )}
            {tab === 3 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Add Note</Typography>
                <TextField value={note} onChange={(e) => setNote(e.target.value)} placeholder="Type note..." multiline minRows={3} fullWidth />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button variant="contained" onClick={addNote} disabled={!note.trim()}>Save Note</Button>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'grid', gap: 1 }}>
                  {(data?.notes || []).map((n: any) => (
                    <Card key={n.id} variant="outlined"><CardContent><Typography variant="body2">{n.body}</Typography><Typography variant="caption" color="text.secondary">{new Date(n.created_at).toLocaleString()}</Typography></CardContent></Card>
                  ))}
                  {(!data?.notes || data.notes.length === 0) && <Typography variant="body2" color="text.secondary">No notes yet.</Typography>}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}


