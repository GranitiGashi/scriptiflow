'use client';
import { useEffect, useMemo, useState } from 'react';
import authManager from '@/lib/auth';
import {
  Calendar,
  dateFnsLocalizer,
  Event as RBCEvent,
  Views,
} from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Custom calendar styles
const customCalendarStyles = `
  .rbc-calendar {
    background: white;
    border-radius: 16px;
    overflow: hidden;
  }
  
  .rbc-header {
    background: #f8fafc !important;
    color: #374151 !important;
    font-weight: 600 !important;
    padding: 16px 8px !important;
    border-bottom: 1px solid #e5e7eb !important;
    font-size: 14px !important;
  }
  
  .rbc-month-view {
    border: none !important;
  }
  
  .rbc-month-row {
    border-bottom: 1px solid #f3f4f6 !important;
  }
  
  .rbc-date-cell {
    padding: 8px !important;
    color: #374151 !important;
  }
  
  .rbc-off-range-bg {
    background: #f9fafb !important;
  }
  
  .rbc-today {
    background: #eff6ff !important;
  }
  
  .rbc-today .rbc-date-cell {
    color: #1d4ed8 !important;
    font-weight: 600 !important;
  }
  
  .rbc-event {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
    border: none !important;
    border-radius: 8px !important;
    color: white !important;
    font-weight: 500 !important;
    font-size: 12px !important;
    padding: 4px 8px !important;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3) !important;
    margin: 1px !important;
  }
  
  .rbc-event:hover {
    background: linear-gradient(135deg, #2563eb, #1e40af) !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4) !important;
  }
  
  .rbc-event-content {
    color: white !important;
  }
  
  .rbc-slot-selection {
    background: rgba(59, 130, 246, 0.1) !important;
  }
  
  .rbc-time-view .rbc-header {
    background: #f8fafc !important;
    border-bottom: 1px solid #e5e7eb !important;
    padding: 12px 8px !important;
  }
  
  .rbc-time-slot {
    border-bottom: 1px solid #f3f4f6 !important;
  }
  
  .rbc-timeslot-group {
    border-bottom: 1px solid #e5e7eb !important;
  }
  
  .rbc-time-content {
    border-left: 1px solid #e5e7eb !important;
  }
  
  .rbc-time-header-content {
    border-bottom: 1px solid #e5e7eb !important;
  }
  
  .rbc-agenda-view table {
    border: none !important;
  }
  
  .rbc-agenda-view .rbc-agenda-table {
    border: 1px solid #e5e7eb !important;
    border-radius: 8px !important;
    overflow: hidden !important;
  }
  
  .rbc-agenda-view .rbc-agenda-date-cell {
    background: #f8fafc !important;
    color: #374151 !important;
    font-weight: 600 !important;
    border-bottom: 1px solid #e5e7eb !important;
  }
  
  .rbc-agenda-view .rbc-agenda-time-cell {
    color: #6b7280 !important;
    font-weight: 500 !important;
  }
  
  .rbc-agenda-view .rbc-agenda-event-cell {
    border-bottom: 1px solid #f3f4f6 !important;
  }
  
  .rbc-toolbar {
    display: none !important;
  }
  
  .rbc-btn-group button {
    border: 1px solid #d1d5db !important;
    color: #374151 !important;
    background: white !important;
    padding: 8px 16px !important;
    border-radius: 8px !important;
    margin: 0 2px !important;
    font-weight: 500 !important;
  }
  
  .rbc-btn-group button:hover {
    background: #f3f4f6 !important;
  }
  
  .rbc-btn-group button.rbc-active {
    background: #3b82f6 !important;
    color: white !important;
    border-color: #3b82f6 !important;
  }
  
  .rbc-popup {
    background: white !important;
    border: 1px solid #e5e7eb !important;
    border-radius: 12px !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
    padding: 16px !important;
    z-index: 1000 !important;
  }
  
  .rbc-popup .rbc-event {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
    border: none !important;
    border-radius: 8px !important;
    color: white !important;
    font-weight: 500 !important;
    font-size: 12px !important;
    padding: 8px 12px !important;
    margin: 4px 0 !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
  }
  
  .rbc-popup .rbc-event:hover {
    background: linear-gradient(135deg, #2563eb, #1e40af) !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4) !important;
  }
`;

// Inject custom styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = customCalendarStyles;
  document.head.appendChild(styleSheet);
}
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

export default function CalendarClient() {
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
  const [googleConnected, setGoogleConnected] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [showMoreEvents, setShowMoreEvents] = useState<any[]>([]);
  const [showMoreDate, setShowMoreDate] = useState<Date | null>(null);
  const [showMoreModal, setShowMoreModal] = useState(false);

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

  const checkConnectionStatus = async () => {
    try {
      // Check Google Calendar status (Gmail integration)
      const googleRes = await authManager.authenticatedFetch(
        `${baseDomain}/api/email/status`
      );
      if (googleRes.ok) {
        const googleData = await googleRes.json();
        setGoogleConnected(googleData.connected || false);
      } else {
        setGoogleConnected(false);
      }

      // Check Outlook status
      const outlookRes = await authManager.authenticatedFetch(
        `${baseDomain}/api/outlook/status`
      );
      if (outlookRes.ok) {
        const outlookData = await outlookRes.json();
        setOutlookConnected(outlookData.connected || false);
      } else {
        setOutlookConnected(false);
      }
    } catch (error) {
      console.error('Failed to check connection status:', error);
      setGoogleConnected(false);
      setOutlookConnected(false);
    }
  };

  const connectOutlook = async () => {
    try {
      const res = await authManager.authenticatedFetch(
        `${baseDomain}/api/outlook/auth-url`
      );
      if (res.ok) {
        const data = await res.json();
        window.open(data.authUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to get Outlook auth URL:', error);
    }
  };

  const disconnectOutlook = async () => {
    try {
      await authManager.authenticatedFetch(
        `${baseDomain}/api/outlook/disconnect`,
        { method: 'POST' }
      );
      setOutlookConnected(false);
      await load(); // Reload events
    } catch (error) {
      console.error('Failed to disconnect Outlook:', error);
    }
  };

  useEffect(() => {
    load();
    checkConnectionStatus();
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

  const onShowMore = (events: any[], date: Date) => {
    console.log('Show more events:', events, date);
    setShowMoreEvents(events);
    setShowMoreDate(date);
    setShowMoreModal(true);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Modern Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              📅 Calendar
            </h1>
            <p className="text-gray-600 text-lg">✨ Manage your appointments and events with style</p>
            
          </div>
          
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Navigation */}
            <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-200 p-1">
              <button
                onClick={() => setDate(new Date())}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <TodayIcon className="w-4 h-4" />
                Today
              </button>
              <div className="h-6 w-px bg-gray-200 mx-1" />
              <button
                onClick={() => setDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1))}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1))}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-200 p-1">
              {[Views.DAY, Views.WEEK, Views.MONTH, Views.AGENDA].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    view === v
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>


            {/* Sync Button */}
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="w-4 h-4 border-2 border-white rounded-full" />
              )}
              {loading ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="relative">
        {/* Decorative elements */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-10 blur-xl"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-10 blur-xl"></div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative z-10">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="font-semibold">Live Calendar</span>
              </div>
              <div className="text-sm opacity-90">
                {date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
          
          <div style={{ height: '75vh' }}>
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
              popupOffset={{ x: 10, y: 10 }}
              onSelectSlot={onSelectSlot}
              onSelectEvent={onSelectEvent}
              onShowMore={onShowMore}
              style={{ height: '100%', padding: '20px' }}
              eventPropGetter={(event) => ({
                style: {
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '6px 12px',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  borderLeft: '4px solid #1d4ed8',
                },
              })}
              components={{
                toolbar: () => null, // Hide default toolbar
              }}
            />
          </div>
        </div>
      </div>

      {/* Modern Event Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          },
        }}
      >
        {/* Dialog Header */}
        <div className="relative p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {form.id ? 'Edit Event' : 'Create New Event'}
              </h2>
              <p className="text-gray-600 mt-1">
                {form.id ? 'Update your event details' : 'Add a new appointment or meeting'}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dialog Content */}
        <div className="p-6 space-y-6">
          {/* Event Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              Event Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f: any) => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter event title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  value={form.start_time ? form.start_time.substring(0, 16) : ''}
                  onChange={(e) => setForm((f: any) => ({ ...f, start_time: new Date(e.target.value).toISOString() }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  value={form.end_time ? form.end_time.substring(0, 16) : ''}
                  onChange={(e) => setForm((f: any) => ({ ...f, end_time: new Date(e.target.value).toISOString() }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <LocationOn className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={form.location || ''}
                    onChange={(e) => setForm((f: any) => ({ ...f, location: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter location"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Car Selection */}
          {cars.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                Vehicle
              </h3>
              
              <TextField
                fullWidth
                select
                label="Car"
                value={form.car_mobile_de_id || ''}
                onChange={(e) =>
                  setForm((f: any) => ({ ...f, car_mobile_de_id: e.target.value }))
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
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
            </div>
          )}

          {/* Customer Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              Customer Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name
                </label>
                <div className="relative">
                  <Person className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={form.customer_name || ''}
                    onChange={(e) => setForm((f: any) => ({ ...f, customer_name: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter customer name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Email
                </label>
                <div className="relative">
                  <Email className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={form.customer_email || ''}
                    onChange={(e) => setForm((f: any) => ({ ...f, customer_email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter customer email"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              Additional Notes
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes & Description
              </label>
              <textarea
                value={form.description || ''}
                onChange={(e) => setForm((f: any) => ({ ...f, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="Add any additional notes or details..."
              />
            </div>
          </div>
        </div>

        {/* Dialog Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div>
            {form.id && (
              <button
                onClick={remove}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors font-medium"
              >
                <DeleteIcon className="w-4 h-4" />
                Delete Event
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(false)}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors font-medium shadow-sm"
            >
              <SaveIcon className="w-4 h-4" />
              {form.id ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </div>
      </Dialog>

      {/* Show More Events Modal */}
      <Dialog
        open={showMoreModal}
        onClose={() => setShowMoreModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          },
        }}
      >
        {/* Modal Header */}
        <div className="relative p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Events for {showMoreDate?.toLocaleDateString()}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {showMoreEvents.length} events scheduled
              </p>
            </div>
            <button
              onClick={() => setShowMoreModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i className="fas fa-times text-gray-400"></i>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="space-y-3">
            {showMoreEvents.map((event, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  // Open the event in the main dialog
                  setForm({
                    id: event.resource?.id,
                    title: event.title,
                    description: event.resource?.description || '',
                    location: event.resource?.location || '',
                    start_time: event.start.toISOString(),
                    end_time: event.end.toISOString(),
                    car_mobile_de_id: event.resource?.car_mobile_de_id || '',
                  });
                  setShowMoreModal(false);
                  setOpen(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {event.title}
                    </h3>
                    {event.resource?.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {event.resource.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <i className="fas fa-clock"></i>
                        {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {event.resource?.location && (
                        <span className="flex items-center gap-1">
                          <i className="fas fa-map-marker-alt"></i>
                          {event.resource.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-3">
                    <i className="fas fa-chevron-right text-gray-400"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={() => setShowMoreModal(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </Dialog>
    </div>
  );
}


