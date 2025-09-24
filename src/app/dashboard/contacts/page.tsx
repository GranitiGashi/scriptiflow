'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useMemo, useState } from 'react';
import authManager from '@/lib/auth';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { Box, Button, Checkbox, FormControlLabel, MenuItem, Select, TextField } from '@mui/material';

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
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [hardDelete, setHardDelete] = useState(false);

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
      if (includeDeleted) params.set('includeDeleted', 'true');
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
  }, [debouncedQ, source, hasEmail, hasPhone, includeDeleted, limit, offset]);

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
    if (!confirm(`Delete ${selectedIds.length} contact(s)? ${hardDelete ? '(hard delete)' : ''}`)) return;
    setLoading(true);
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/contacts/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, hard: hardDelete }),
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
    <DashboardLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb', p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Box component="h2" sx={{ fontSize: 20, fontWeight: 600 }}>Contacts</Box>
            <Box sx={{ fontSize: 12, color: 'text.secondary' }}>Search, filter, export and bulk-manage your contacts.</Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={exportCsv}>Export CSV</Button>
            <Button variant="contained" color="error" onClick={bulkDelete} disabled={selectedIds.length === 0 || loading}>Delete selected</Button>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr 1fr' }, gap: 1, bgcolor: 'white', p: 2, borderRadius: 1, mb: 2, boxShadow: 1 }}>
          <TextField size="small" label="Search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email, phone" />
          <TextField size="small" label="Source" value={source} onChange={(e) => setSource(e.target.value)} placeholder="gmail/outlook/whatsapp" />
          <FormControlLabel control={<Checkbox checked={hasEmail} onChange={(e) => setHasEmail(e.target.checked)} />} label="Has email" />
          <FormControlLabel control={<Checkbox checked={hasPhone} onChange={(e) => setHasPhone(e.target.checked)} />} label="Has phone" />
          <FormControlLabel control={<Checkbox checked={includeDeleted} onChange={(e) => setIncludeDeleted(e.target.checked)} />} label="Include deleted" />
          <FormControlLabel control={<Checkbox checked={hardDelete} onChange={(e) => setHardDelete(e.target.checked)} />} label="Hard delete" />
          <Select size="small" value={limit} onChange={(e) => { setOffset(0); setLimit(Number(e.target.value)); }}>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </Box>

        <Box sx={{ height: 600, width: '100%', bgcolor: 'white', borderRadius: 1, boxShadow: 1 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(r) => r.id}
            loading={loading}
            disableRowSelectionOnClick
            onRowClick={(p) => { window.location.href = `/dashboard/contacts/${p.row.id}`; }}
            slots={{ toolbar: GridToolbar }}
            paginationModel={{ page: Math.floor(offset / limit), pageSize: limit }}
            onPaginationModelChange={(m) => { setLimit(m.pageSize); setOffset(m.page * m.pageSize); }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Box sx={{ fontSize: 12, color: 'text.secondary' }}>Selected: {selectedIds.length}</Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
}


