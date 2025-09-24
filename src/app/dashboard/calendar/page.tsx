'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useMemo, useState } from 'react';
import authManager from '@/lib/auth';
import { Calendar, dateFnsLocalizer, Event as RBCEvent } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from '@mui/material';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek: () => startOfWeek(new Date()), getDay, locales });

interface CalRow { id: string; title: string; description?: string | null; location?: string | null; start_time: string; end_time: string; car_mobile_de_id?: string | null; contact_id?: string | null; }

export default function CalendarPage() {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const [rows, setRows] = useState<CalRow[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ id?: string; title: string; description?: string; location?: string; start_time: string; end_time: string; car_mobile_de_id?: string; contact_id?: string; }>({ title: '', start_time: '', end_time: '', location: '' });
  const [cars, setCars] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(false);

  const events = useMemo<RBCEvent[]>(() => rows.map(r => ({ id: r.id, title: r.title, start: new Date(r.start_time), end: new Date(r.end_time), resource: r })), [rows]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/calendar/events`);
      if (res.ok) setRows(await res.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); (async () => { try { const res = await authManager.authenticatedFetch(`${baseDomain}/api/mobilede/listings`); if (res.ok) { const data = await res.json(); const mapped = (Array.isArray(data) ? data : []).map((d: any) => ({ id: d.mobile_ad_id || d.id, title: d.title || d.details?.model || 'Car' })); setCars(mapped); } } catch {} })(); }, []);

  const onSelectSlot = (slot: any) => {
    setForm({ title: '', start_time: slot.start.toISOString(), end_time: slot.end.toISOString(), location: '' });
    setOpen(true);
  };
  const onSelectEvent = (e: any) => {
    const r: CalRow = e.resource;
    setForm({ id: r.id, title: r.title, description: r.description || '', location: r.location || '', start_time: r.start_time, end_time: r.end_time, car_mobile_de_id: r.car_mobile_de_id || '' });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title || !form.start_time || !form.end_time) return;
    const body = { title: form.title, description: form.description, location: form.location, start_time: form.start_time, end_time: form.end_time, car_mobile_de_id: form.car_mobile_de_id || null, contact_id: form.contact_id || null };
    if (form.id) {
      await authManager.authenticatedFetch(`${baseDomain}/api/calendar/events/${form.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } else {
      await authManager.authenticatedFetch(`${baseDomain}/api/calendar/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    setOpen(false);
    await load();
  };

  const remove = async () => {
    if (!form.id) return;
    await authManager.authenticatedFetch(`${baseDomain}/api/calendar/events/${form.id}`, { method: 'DELETE' });
    setOpen(false);
    await load();
  };

  return (
    <DashboardLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ fontSize: 18, fontWeight: 600 }}>Calendar</Box>
          <Button variant="outlined" onClick={load} disabled={loading}>{loading ? 'Syncing…' : 'Sync Now'}</Button>
        </Box>
        <Box sx={{ height: '70vh', bgcolor: 'white', borderRadius: 1, boxShadow: 1, p: 1 }}>
          <Calendar
            localizer={localizer}
            events={events}
            selectable
            startAccessor="start"
            endAccessor="end"
            onSelectSlot={onSelectSlot}
            onSelectEvent={onSelectEvent}
            style={{ height: '100%' }}
          />
        </Box>

        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>{form.id ? 'Edit Event' : 'Create Event'}</DialogTitle>
          <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
            <TextField label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <TextField label="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            <TextField label="Start" type="datetime-local" value={form.start_time ? form.start_time.substring(0,16) : ''} onChange={(e) => setForm((f) => ({ ...f, start_time: new Date(e.target.value).toISOString() }))} />
            <TextField label="End" type="datetime-local" value={form.end_time ? form.end_time.substring(0,16) : ''} onChange={(e) => setForm((f) => ({ ...f, end_time: new Date(e.target.value).toISOString() }))} />
            <TextField label="Car" select value={form.car_mobile_de_id || ''} onChange={(e) => setForm((f) => ({ ...f, car_mobile_de_id: e.target.value }))}>
              {cars.map(c => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
            </TextField>
            <TextField label="Notes" multiline minRows={3} value={form.description || ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </DialogContent>
          <DialogActions>
            {form.id && <Button color="error" onClick={remove}>Delete</Button>}
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={save}>Save</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}


