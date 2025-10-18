'use client';

import { useEffect, useMemo, useState } from 'react';
import authManager from '@/lib/auth';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Box,
  Button,
  Checkbox,
  TextField,
  Paper,
  Stack,
  Chip,
  InputAdornment,
  Pagination,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';

interface ContactRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export default function ContactsPage() {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';

  const [rows, setRows] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [source, setSource] = useState('');
  const [hasEmail, setHasEmail] = useState(false);
  const [hasPhone, setHasPhone] = useState(false);
  const [limit, setLimit] = useState(25);
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(id);
  }, [q]);

  const selectedIds = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQ) params.set('q', debouncedQ);
      if (source) params.set('source', source);
      if (hasEmail) params.set('hasEmail', 'true');
      if (hasPhone) params.set('hasPhone', 'true');

      params.set('limit', String(limit));
      params.set('offset', String(offset));
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/contacts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRows(data);
        setSelected({});
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [debouncedQ, source, hasEmail, hasPhone, limit, offset]);

  const toggleAll = (checked: boolean) => {
    const map: Record<string, boolean> = {};
    if (checked) rows.forEach(r => map[r.id] = true);
    setSelected(map);
  };

  const exportCsv = async () => {
    const token = await authManager.getValidAccessToken();
    const refresh = localStorage.getItem('refresh_token') || '';
    const res = await fetch(`${baseDomain}/api/contacts/export`, { headers: { Authorization: `Bearer ${token}`, 'x-refresh-token': refresh } });
    if (!res.ok) return alert('Export failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const bulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`Delete ${selectedIds.length} contact(s)?`)) return;
    setLoading(true);
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/contacts/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, hard: false }),
      });
      if (res.ok) await fetchData();
      else {
        const err = await res.json();
        alert(err.error || 'Delete failed');
      }
    } finally { setLoading(false); }
  };

  const totalActive = rows.filter(r => !r.deleted_at).length;
  const totalDeleted = rows.filter(r => r.deleted_at).length;

  const columns: GridColDef<ContactRow>[] = [
    { field: 'select', headerName: '', width: 50, sortable: false, filterable: false,
      renderHeader: () => <Checkbox checked={rows.length > 0 && selectedIds.length === rows.length} onChange={(e) => toggleAll(e.target.checked)} />,
      renderCell: (params) => <Checkbox checked={!!selected[params.row.id]} onChange={(e) => setSelected(s => ({ ...s, [params.row.id]: e.target.checked }))} />
    },
    { field: 'name', headerName: 'Name', flex: 1, valueGetter: (p) => [p.row.first_name, p.row.last_name].filter(Boolean).join(' ') || '—' },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'phone', headerName: 'Phone', flex: 1 },
    { field: 'source', headerName: 'Source', width: 140 },
    { field: 'created_at', headerName: 'Created', width: 140, valueGetter: (p) => new Date(p.row.created_at).toLocaleDateString() },
    { field: 'status', headerName: 'Status', width: 120,
      renderCell: (params) => <Chip label={params.row.deleted_at ? 'Deleted' : 'Active'} color={params.row.deleted_at ? 'error' : 'success'} size="small" variant="filled" />
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f4f8', p: { xs: 2, md: 4 } }}>

      {/* Summary Cards */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={4}>
        <Paper sx={{ flex: 1, p: 3, borderRadius: 2, bgcolor: '#1976d2', color: 'white', boxShadow: 4 }}>
          <Typography variant="h6">Total Contacts</Typography>
          <Typography variant="h4">{rows.length}</Typography>
        </Paper>
        <Paper sx={{ flex: 1, p: 3, borderRadius: 2, bgcolor: '#2e7d32', color: 'white', boxShadow: 4 }}>
          <Typography variant="h6">Active</Typography>
          <Typography variant="h4">{totalActive}</Typography>
        </Paper>
        <Paper sx={{ flex: 1, p: 3, borderRadius: 2, bgcolor: '#d32f2f', color: 'white', boxShadow: 4 }}>
          <Typography variant="h6">Deleted</Typography>
          <Typography variant="h4">{totalDeleted}</Typography>
        </Paper>
      </Stack>

      {/* Header + Actions */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary">Contacts</Typography>
          <Typography variant="body2" color="text.secondary">Search, filter, export, and manage your contacts efficiently.</Typography>
        </Box>
        <Stack direction="row" spacing={1} mt={{ xs: 1, md: 0 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />} color="secondary" onClick={exportCsv}>Export CSV</Button>
          <Button variant="contained" startIcon={<DeleteIcon />} color="error" disabled={selectedIds.length === 0 || loading} onClick={bulkDelete}>Delete selected</Button>
        </Stack>
      </Stack>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 3, bgcolor: '#ffffff', position: 'sticky', top: 0, zIndex: 10 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
          <TextField
            size="small"
            placeholder="Search name, email, or phone"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              )
            }}
          />
          <TextField
            size="small"
            label="Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="gmail/outlook/whatsapp"
          />
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip label="Has email" clickable variant={hasEmail ? 'filled' : 'outlined'} color={hasEmail ? 'primary' : 'default'} onClick={() => setHasEmail(!hasEmail)} />
            <Chip label="Has phone" clickable variant={hasPhone ? 'filled' : 'outlined'} color={hasPhone ? 'primary' : 'default'} onClick={() => setHasPhone(!hasPhone)} />
            <Button size="small" onClick={() => { setQ(''); setDebouncedQ(''); setSource(''); setHasEmail(false); setHasPhone(false); setOffset(0); }}>Reset</Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Data Grid */}
      <Paper sx={{ height: 600, width: '100%', borderRadius: 2, boxShadow: 3, overflow: 'hidden' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id}
          loading={loading}
          disableRowSelectionOnClick
          onRowClick={(p) => { window.location.href = `/dashboard/contacts/${p.row.id}`; }}
          paginationModel={{ page: Math.floor(offset / limit), pageSize: limit }}
          pageSizeOptions={[limit]}
          hideFooterPagination
          sx={{
            '& .MuiDataGrid-columnHeaders': { bgcolor: '#bbdefb', fontWeight: 600 },
            '& .MuiDataGrid-row:nth-of-type(odd)': { bgcolor: '#f5f7fa' },
            '& .MuiDataGrid-row:hover': { bgcolor: '#e3f2fd', cursor: 'pointer' },
            '& .MuiDataGrid-cell': { py: 1 },
          }}
        />
      </Paper>

      {/* Footer */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mt={2}>
        <Typography variant="body2" color="text.secondary">Selected: {selectedIds.length}</Typography>
        <Pagination
          count={Math.max(1, Math.floor(offset / limit) + (rows.length === limit ? 2 : 1))}
          page={Math.floor(offset / limit) + 1}
          onChange={(_, p) => setOffset((p - 1) * limit)}
          color="primary"
          shape="rounded"
        />
      </Stack>
    </Box>
  );
}
//eraaaaaaaaaaaaaaa