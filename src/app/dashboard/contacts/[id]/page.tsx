'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import authManager from '@/lib/auth';
import { 
  Avatar, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Divider, 
  Tab, 
  Tabs, 
  TextField, 
  Typography,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  Alert,
  Grid,
  Paper,
  Badge,
  Fade,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Note as NoteIcon,
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  Share as ShareIcon,
  Print as PrintIcon
} from '@mui/icons-material';

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const [data, setData] = useState<any>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/contacts/${id}`);
      if (res.ok) {
        const contactData = await res.json();
        setData(contactData);
        setEditData({
          first_name: contactData.contact?.first_name || '',
          last_name: contactData.contact?.last_name || '',
          email: contactData.contact?.email || '',
          phone: contactData.contact?.phone || ''
        });
      } else {
        setError('Failed to load contact details');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { if (id) load(); }, [id]);

  const initials = useMemo(() => {
    const n = `${data?.contact?.first_name || ''} ${data?.contact?.last_name || ''}`.trim();
    return n ? n.split(' ').map((p: string) => p.slice(0,1)).join('').slice(0,2).toUpperCase() : (data?.contact?.email?.slice(0,1)?.toUpperCase() || '?');
  }, [data]);

  const addNote = async () => {
    if (!note.trim()) return;
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/contacts/${id}/notes`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ body: note.trim() }) 
      });
      if (res.ok) { 
        setNote(''); 
        setSuccess('Note added successfully');
        await load(); 
      } else {
        setError('Failed to add note');
      }
    } catch (err) {
      setError('Failed to add note');
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData({
      first_name: data?.contact?.first_name || '',
      last_name: data?.contact?.last_name || '',
      email: data?.contact?.email || '',
      phone: data?.contact?.phone || ''
    });
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      if (res.ok) {
        setSuccess('Contact updated successfully');
        setEditing(false);
        await load();
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to update contact');
      }
    } catch (err) {
      setError('Failed to update contact');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/contacts/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        router.push('/dashboard/contacts');
      } else {
        setError('Failed to delete contact');
      }
    } catch (err) {
      setError('Failed to delete contact');
    }
  };

  const [tab, setTab] = useState(0);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', p: 3 }}>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width={200} />
          </Box>
          <Skeleton variant="rectangular" height={400} />
        </Stack>
      </Box>
    );
  }

  if (error && !data) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          {error}
          <Button onClick={load} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafbfc', p: 3 }}>
      {/* Simple Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/dashboard/contacts')}
            sx={{ textTransform: 'none' }}
          >
            Back to Contacts
          </Button>
        </Stack>

        {/* Messages */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Contact Header */}
      <Card sx={{ mb: 3, p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={3}>
          <Avatar sx={{ width: 80, height: 80, fontSize: '1.5rem' }}>
            {initials}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            {editing ? (
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <TextField
                    size="small"
                    label="First Name"
                    value={editData.first_name}
                    onChange={(e) => setEditData(prev => ({ ...prev, first_name: e.target.value }))}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    label="Last Name"
                    value={editData.last_name}
                    onChange={(e) => setEditData(prev => ({ ...prev, last_name: e.target.value }))}
                    sx={{ flex: 1 }}
                  />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <TextField
                    size="small"
                    label="Email"
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    label="Phone"
                    value={editData.phone}
                    onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                    sx={{ flex: 1 }}
                  />
                </Stack>
              </Stack>
            ) : (
              <Box>
                <Typography variant="h4" sx={{ mb: 1 }}>
                  {[data?.contact?.first_name, data?.contact?.last_name].filter(Boolean).join(' ') || 'Contact'}
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                  <Typography variant="body1" color="text.secondary">
                    <EmailIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {data?.contact?.email || 'No email'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    <PhoneIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {data?.contact?.phone || 'No phone'}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Source: {data?.contact?.source || 'Unknown'}
                </Typography>
              </Box>
            )}
          </Box>

          <Box>
            {editing ? (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </Stack>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </Stack>
            )}
          </Box>
        </Stack>
      </Card>

      {/* Content Tabs */}
      <Card>
        <Tabs 
          value={tab} 
          onChange={(_, v) => setTab(v)} 
          variant="scrollable" 
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`Upcoming (${data?.upcoming?.length || 0})`} />
          <Tab label={`Past (${data?.history?.length || 0})`} />
          <Tab label={`Emails (${data?.emails?.length || 0})`} />
          <Tab label={`Notes (${data?.notes?.length || 0})`} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tab === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Upcoming Events
              </Typography>
              <Stack spacing={2}>
                {(data?.upcoming || []).map((ev: any) => (
                  <Box key={ev.id} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>{ev.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {new Date(ev.start_time).toLocaleString()} - {new Date(ev.end_time).toLocaleString()}
                    </Typography>
                    {ev.car_mobile_de_id && (
                      <Typography variant="caption" color="text.secondary">
                        Car: {ev.car_mobile_de_id}
                      </Typography>
                    )}
                  </Box>
                ))}
                {(!data?.upcoming || data.upcoming.length === 0) && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No upcoming events
                  </Typography>
                )}
              </Stack>
            </Box>
          )}

          {tab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Past Events
              </Typography>
              <Stack spacing={2}>
                {(data?.history || []).map((ev: any) => (
                  <Box key={ev.id} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>{ev.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {new Date(ev.start_time).toLocaleString()} - {new Date(ev.end_time).toLocaleString()}
                    </Typography>
                    {ev.car_mobile_de_id && (
                      <Typography variant="caption" color="text.secondary">
                        Car: {ev.car_mobile_de_id}
                      </Typography>
                    )}
                  </Box>
                ))}
                {(!data?.history || data.history.length === 0) && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No past events
                  </Typography>
                )}
              </Stack>
            </Box>
          )}

          {tab === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Email History
              </Typography>
              <Stack spacing={2}>
                {(data?.emails || []).map((em: any) => (
                  <Box key={em.id} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>{em.subject || '(no subject)'}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      {new Date(em.received_at).toLocaleString()} • {em.provider}
                    </Typography>
                    <Typography variant="body2">{em.snippet}</Typography>
                  </Box>
                ))}
                {(!data?.emails || data.emails.length === 0) && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No emails found
                  </Typography>
                )}
              </Stack>
            </Box>
          )}

          {tab === 3 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Notes
              </Typography>
              
              {/* Add Note Form */}
              <Box sx={{ mb: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Add New Note</Typography>
                <TextField 
                  value={note} 
                  onChange={(e) => setNote(e.target.value)} 
                  placeholder="Type your note here..." 
                  multiline 
                  minRows={3} 
                  fullWidth 
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="contained" 
                    onClick={addNote} 
                    disabled={!note.trim()}
                  >
                    Save Note
                  </Button>
                </Box>
              </Box>

              {/* Notes List */}
              <Stack spacing={2}>
                {(data?.notes || []).map((n: any) => (
                  <Box key={n.id} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>{n.body}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(n.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
                {(!data?.notes || data.notes.length === 0) && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No notes yet
                  </Typography>
                )}
              </Stack>
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
}


