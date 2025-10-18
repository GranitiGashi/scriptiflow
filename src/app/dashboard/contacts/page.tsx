'use client';

import { useEffect, useMemo, useState } from 'react';
import authManager from '@/lib/auth';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Button, Checkbox, TextField, Paper, Stack, Chip, InputAdornment, Pagination } from '@mui/material';
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
    const id = setTimeout(() => setDebouncedQ(q), 350);
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

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, source, hasEmail, hasPhone, limit, offset]);

  const toggleAll = (checked: boolean) => {
    const map: Record<string, boolean> = {};
    if (checked) {
      for (const r of rows) map[r.id] = true;
    }
    setSelected(map);
  };

  const exportCsv = async () => {
    const token = await authManager.getValidAccessToken();
    const refresh = localStorage.getItem('refresh_token') || '';
    const res = await fetch(`${baseDomain}/api/contacts/export`, { headers: { Authorization: `Bearer ${token}`, 'x-refresh-token': refresh } });
    if (!res.ok) {
      alert('Export failed');
      return;
    }
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
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} contact(s)?`)) return;
    setLoading(true);
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/contacts/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, hard: false }),
      });
      if (res.ok) {
        await fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Delete failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef<ContactRow>[] = [
    {
      field: 'select', headerName: '', width: 50, sortable: false, filterable: false,
      renderHeader: () => (
        <Checkbox
          checked={rows.length > 0 && selectedIds.length === rows.length}
          onChange={(e) => toggleAll(e.target.checked)}
        />
      ),
      renderCell: (params) => (
        <Checkbox
          checked={!!selected[params.row.id]}
          onChange={(e) => setSelected((s) => ({ ...s, [params.row.id]: e.target.checked }))}
        />
      )
    },
    { field: 'name', headerName: 'Name', flex: 1, valueGetter: (p) => ([p.row.first_name, p.row.last_name].filter(Boolean).join(' ') || '—') },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'phone', headerName: 'Phone', flex: 1 },
    { field: 'source', headerName: 'Source', width: 140 },
    { field: 'created_at', headerName: 'Created', width: 140, valueGetter: (p) => new Date(p.row.created_at).toLocaleDateString() },
    { field: 'status', headerName: 'Status', width: 120, valueGetter: (p) => (p.row.deleted_at ? 'Deleted' : 'Active') },
  ];

  return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb', p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Box component="h2" sx={{ fontSize: 20, fontWeight: 600 }}>Contacts</Box>
            <Box sx={{ fontSize: 12, color: 'text.secondary' }}>Search, filter, export and bulk-manage your contacts.</Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportCsv}>Export CSV</Button>
            <Button variant="contained" startIcon={<DeleteIcon />} color="error" onClick={bulkDelete} disabled={selectedIds.length === 0 || loading}>Delete selected</Button>
          </Box>
        </Box>

        <Paper sx={{ p: 2, borderRadius: 1, mb: 2, boxShadow: 1 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ xs: 'stretch', md: 'center' }}>
            <TextField
              size="small"
              placeholder="Search name, email, or phone"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              InputProps={{ startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ) }}
            />
            <TextField size="small" label="Source" value={source} onChange={(e) => setSource(e.target.value)} placeholder="gmail/outlook/whatsapp" />
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label="Has email" clickable variant={hasEmail ? 'filled' : 'outlined'} color={hasEmail ? 'primary' : 'default'} onClick={() => setHasEmail(!hasEmail)} />
              <Chip label="Has phone" clickable variant={hasPhone ? 'filled' : 'outlined'} color={hasPhone ? 'primary' : 'default'} onClick={() => setHasPhone(!hasPhone)} />
              <Button size="small" onClick={() => { setQ(''); setDebouncedQ(''); setSource(''); setHasEmail(false); setHasPhone(false); setOffset(0); }}>Reset</Button>
            </Stack>
          </Stack>
        </Paper>

        <Box sx={{ height: 600, width: '100%', bgcolor: 'white', borderRadius: 1, boxShadow: 1 }}>
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
            sx={{ '& .MuiDataGrid-columnHeaders': { bgcolor: '#f3f4f6' }, '& .MuiDataGrid-row:hover': { bgcolor: '#f9fafb' } }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Box sx={{ fontSize: 12, color: 'text.secondary' }}>Selected: {selectedIds.length}</Box>
          <Pagination
            count={Math.max(1, Math.floor(offset / limit) + (rows.length === limit ? 2 : 1))}
            page={Math.floor(offset / limit) + 1}
            onChange={(_, p) => setOffset((p - 1) * limit)}
            color="primary"
            shape="rounded"
          />
        </Box>
      </Box>
  );
}


