'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useMemo, useState } from 'react';
import authManager from '@/lib/auth';
import {
  Calendar,
  dateFnsLocalizer,
  Event as RBCEvent,
  Views,
} from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today as TodayIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  LocationOn,
  Person,
  Email,
} from '@mui/icons-material';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalRow {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  start_time: string;
  end_time: string;
  car_mobile_de_id?: string | null;
  contact_id?: string | null;
}

export default function CalendarPage() {
  const baseDomain =
    process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const [rows, setRows] = useState<CalRow[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({
    title: '',
    start_time: '',
    end_time: '',
    location: '',
  });
  const [cars, setCars] = useState<
    Array<{ id: string; title: string; image?: string | null }>
  >([]);
  const [loading, setLoading] = useState(false);

  const events = useMemo<RBCEvent[]>(
    () =>
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        start: new Date(r.start_time),
        end: new Date(r.end_time),
        resource: r,
      })),
    [rows]
  );

  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<string>(Views.WEEK);

  const load = async () => {
    setLoading(true);
    try {
      const res = await authManager.authenticatedFetch(
        `${baseDomain}/api/calendar/events`
      );
      if (res.ok) setRows(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    (async () => {
      try {
        const res = await authManager.authenticatedFetch(
          `${baseDomain}/api/get-user-cars`,
          { headers: { Accept: 'application/json' } }
        );
        if (!res.ok) return;
        const data = await res.json();
        const rawCars: any[] = Array.isArray(data?.['search-result']?.ads?.ad)
          ? data['search-result'].ads.ad
          : Array.isArray(data?.ads)
          ? data.ads
          : Array.isArray(data)
          ? data
          : [];
        const mapped = rawCars.map((c: any) => {
          const id = c['@key'] || c.mobileAdId || c.id || '';
          const make =
            c?.vehicle?.make?.['@key'] || c?.vehicle?.make || c?.make || '';
          const model =
            c?.vehicle?.model?.['@key'] || c?.vehicle?.model || c?.model || '';
          const modelDescription =
            c?.vehicle?.['model-description']?.['@value'] ||
            c?.modelDescription ||
            '';
          const title = [make, model, modelDescription]
            .filter(Boolean)
            .join(' ')
            .trim() || 'Car';
          let image: string | null = null;
          if (Array.isArray(c?.images) && c.images.length > 0) {
            const i0 = c.images[0];
            image = i0?.m || i0?.s || i0?.xl || i0?.xxl || null;
          } else if (c?.images?.image?.representation?.[0]?.['@url']) {
            image = c.images.image.representation[0]['@url'];
          }
          return { id: String(id), title, image };
        });
        setCars(mapped);
      } catch {}
    })();
  }, []);

  const onSelectSlot = (slot: any) => {
    setForm({
      title: '',
      start_time: slot.start.toISOString(),
      end_time: slot.end.toISOString(),
      location: '',
    });
    setOpen(true);
  };

  const onSelectEvent = (e: any) => {
    const r: CalRow = e.resource;
    setForm({
      id: r.id,
      title: r.title,
      description: r.description || '',
      location: r.location || '',
      start_time: r.start_time,
      end_time: r.end_time,
      car_mobile_de_id: r.car_mobile_de_id || '',
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title || !form.start_time || !form.end_time) return;
    const body = {
      title: form.title,
      description: form.description,
      location: form.location,
      start_time: form.start_time,
      end_time: form.end_time,
      car_mobile_de_id: form.car_mobile_de_id || null,
      contact_id: form.contact_id || null,
      customer_name: form.customer_name || null,
      customer_email: form.customer_email || null,
    };
    const url = form.id
      ? `${baseDomain}/api/calendar/events/${form.id}`
      : `${baseDomain}/api/calendar/events`;
    const method = form.id ? 'PUT' : 'POST';
    const res = await authManager.authenticatedFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      alert(e.error || 'Failed to save event');
      return;
    }
    setOpen(false);
    await load();
  };

  const remove = async () => {
    if (!form.id) return;
    await authManager.authenticatedFetch(
      `${baseDomain}/api/calendar/events/${form.id}`,
      { method: 'DELETE' }
    );
    setOpen(false);
    await load();
  };

  return (
    <DashboardLayout>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#f8fafc',
          p: 3,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{ color: '#111827' }}
          >
            Calendar
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ButtonGroup size="small" variant="outlined">
              <Button
                startIcon={<TodayIcon />}
                onClick={() => setDate(new Date())}
              >
                Today
              </Button>
              <IconButton
                onClick={() =>
                  setDate(
                    new Date(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate() - 1
                    )
                  )
                }
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                onClick={() =>
                  setDate(
                    new Date(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate() + 1
                    )
                  )
                }
              >
                <ChevronRight />
              </IconButton>
            </ButtonGroup>
            <ToggleButtonGroup
              size="small"
              value={view}
              exclusive
              onChange={(_, v) => v && setView(v)}
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'white',
                boxShadow: 1,
              }}
            >
              <ToggleButton value={Views.DAY}>Day</ToggleButton>
              <ToggleButton value={Views.WEEK}>Week</ToggleButton>
              <ToggleButton value={Views.MONTH}>Month</ToggleButton>
              <ToggleButton value={Views.AGENDA}>Agenda</ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="contained"
              onClick={load}
              disabled={loading}
              sx={{
                ml: 1,
                borderRadius: 2,
                textTransform: 'none',
                bgcolor: '#4f46e5',
                '&:hover': { bgcolor: '#4338ca' },
              }}
            >
              {loading ? 'Syncing…' : 'Sync Now'}
            </Button>
          </Box>
        </Box>

        {/* Calendar Card */}
        <Card
          sx={{
            height: '75vh',
            borderRadius: 4,
            boxShadow: 4,
            p: 2,
            bgcolor: 'white',
          }}
        >
          <Calendar
            localizer={localizer}
            events={events}
            selectable
            startAccessor="start"
            endAccessor="end"
            date={date}
            onNavigate={(d) => setDate(d as Date)}
            view={view as any}
            onView={(v) => setView(v as string)}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            popup
            onSelectSlot={onSelectSlot}
            onSelectEvent={onSelectEvent}
            style={{ height: '100%' }}
          />
        </Card>

        {/* Event Dialog */}
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1,
            },
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              {form.id ? 'Edit Event' : 'Create Event'}
            </Typography>
            <IconButton
              sx={{ ml: 'auto' }}
              onClick={() => setOpen(false)}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {/* Event Info */}
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: 600 }}
            >
              Event Info
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, title: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Start"
                  type="datetime-local"
                  value={form.start_time ? form.start_time.substring(0, 16) : ''}
                  onChange={(e) =>
                    setForm((f: any) => ({
                      ...f,
                      start_time: new Date(e.target.value).toISOString(),
                    }))
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="End"
                  type="datetime-local"
                  value={form.end_time ? form.end_time.substring(0, 16) : ''}
                  onChange={(e) =>
                    setForm((f: any) => ({
                      ...f,
                      end_time: new Date(e.target.value).toISOString(),
                    }))
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={form.location}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, location: e.target.value }))
                  }
                  InputProps={{
                    startAdornment: <LocationOn fontSize="small" sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Car Info */}
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: 600 }}
            >
              Car Info
            </Typography>
            <TextField
              fullWidth
              select
              label="Car"
              value={form.car_mobile_de_id || ''}
              onChange={(e) =>
                setForm((f: any) => ({ ...f, car_mobile_de_id: e.target.value }))
              }
            >
              {cars.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  <Avatar
                    variant="rounded"
                    src={c.image || undefined}
                    sx={{ width: 28, height: 28, mr: 1 }}
                  >
                    {c.title.slice(0, 1)}
                  </Avatar>
                  <Box>{c.title}</Box>
                </MenuItem>
              ))}
            </TextField>

            <Divider sx={{ my: 2 }} />

            {/* Customer Info */}
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: 600 }}
            >
              Customer Info
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  value={form.customer_name || ''}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, customer_name: e.target.value }))
                  }
                  InputProps={{
                    startAdornment: <Person fontSize="small" sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Customer Email"
                  value={form.customer_email || ''}
                  onChange={(e) =>
                    setForm((f: any) => ({
                      ...f,
                      customer_email: e.target.value,
                    }))
                  }
                  InputProps={{
                    startAdornment: <Email fontSize="small" sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Notes */}
            <TextField
              fullWidth
              label="Notes"
              multiline
              minRows={3}
              value={form.description || ''}
              onChange={(e) =>
                setForm((f: any) => ({ ...f, description: e.target.value }))
              }
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            {form.id && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={remove}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Delete
              </Button>
            )}
            <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={save}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                bgcolor: '#4f46e5',
                '&:hover': { bgcolor: '#4338ca' },
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}
