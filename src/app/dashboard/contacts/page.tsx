'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
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

  const handleContactClick = (contactId: string) => {
    router.push(`/dashboard/contacts/${contactId}`);
  };

  const columns: GridColDef<ContactRow>[] = [
    { field: 'select', headerName: '', width: 50, sortable: false, filterable: false,
      renderHeader: () => <Checkbox checked={rows.length > 0 && selectedIds.length === rows.length} onChange={(e) => toggleAll(e.target.checked)} />,
      renderCell: (params) => <Checkbox checked={!!selected[params.row.id]} onChange={(e) => setSelected(s => ({ ...s, [params.row.id]: e.target.checked }))} />
    },
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1, 
      editable: true,
      valueGetter: (p) => [p.row.first_name, p.row.last_name].filter(Boolean).join(' ') || '—',
      valueSetter: (params) => {
        const value = params.value;
        const parts = String(value || '').trim().split(' ');
        return { 
          ...params.row, 
          first_name: parts[0] || '', 
          last_name: parts.slice(1).join(' ') || '' 
        };
      },
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            cursor: 'pointer', 
            color: 'primary.main',
            textDecoration: 'underline',
            '&:hover': { color: 'primary.dark' }
          }}
          onClick={() => handleContactClick(params.row.id)}
        >
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      flex: 1, 
      editable: true,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            color: params.value ? '#4b5563' : '#9ca3af',
            fontStyle: params.value ? 'normal' : 'italic'
          }}
        >
          {params.value || 'No email'}
        </Typography>
      )
    },
    { 
      field: 'phone', 
      headerName: 'Phone', 
      flex: 1, 
      editable: true,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            color: params.value ? '#4b5563' : '#9ca3af',
            fontStyle: params.value ? 'normal' : 'italic'
          }}
        >
          {params.value || 'No phone'}
        </Typography>
      )
    },
    { field: 'source', headerName: 'Source', width: 140 },
    { field: 'created_at', headerName: 'Created', width: 140, valueGetter: (p) => new Date(p.row.created_at).toLocaleDateString() },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafbfc', p: { xs: 2, md: 4 }, maxWidth: '1400px', mx: 'auto' }}>

      {/* Header + Actions */}
      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ color: '#1a1a1a', mb: 0.5 }}>
              Contacts <Box component="span" sx={{ color: '#666', fontWeight: 400, fontSize: '1.5rem' }}>({rows.length})</Box>
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>Manage and organize your contacts</Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />} 
              onClick={exportCsv}
              sx={{ 
                borderColor: '#ddd', 
                color: '#555',
                '&:hover': { borderColor: '#999', bgcolor: '#f5f5f5' }
              }}
            >
              Export
            </Button>
            <Button 
              variant="contained" 
              startIcon={<DeleteIcon />} 
              disabled={selectedIds.length === 0 || loading} 
              onClick={bulkDelete}
              sx={{ 
                bgcolor: '#dc3545',
                '&:hover': { bgcolor: '#c82333' },
                '&:disabled': { bgcolor: '#e0e0e0' }
              }}
            >
              Delete ({selectedIds.length})
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', bgcolor: '#ffffff', border: '1px solid #e5e7eb' }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                size="small"
                placeholder="Search by name, email, or phone..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: '#999' }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#fafafa',
                    '&:hover': { bgcolor: '#f5f5f5' },
                    '&.Mui-focused': { bgcolor: '#fff' }
                  }
                }}
              />
            </Box>
            <Box sx={{ minWidth: { xs: '100%', md: '200px' } }}>
              <TextField
                size="small"
                label="Source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="gmail/outlook/whatsapp"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#fafafa',
                    '&:hover': { bgcolor: '#f5f5f5' },
                    '&.Mui-focused': { bgcolor: '#fff' }
                  }
                }}
              />
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
            <Typography variant="body2" sx={{ color: '#666', mr: 1 }}>Filters:</Typography>
            <Chip 
              label="Has Email" 
              clickable 
              variant={hasEmail ? 'filled' : 'outlined'} 
              color={hasEmail ? 'primary' : 'default'} 
              onClick={() => setHasEmail(!hasEmail)}
              size="small"
            />
            <Chip 
              label="Has Phone" 
              clickable 
              variant={hasPhone ? 'filled' : 'outlined'} 
              color={hasPhone ? 'primary' : 'default'} 
              onClick={() => setHasPhone(!hasPhone)}
              size="small"
            />
            <Button 
              size="small" 
              variant="text"
              onClick={() => { setQ(''); setDebouncedQ(''); setSource(''); setHasEmail(false); setHasPhone(false); setOffset(0); }}
              sx={{ ml: 'auto', color: '#666', textTransform: 'none' }}
            >
              Clear all
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Data Grid */}
      <Paper sx={{ width: '100%', borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id}
          loading={loading}
          disableRowSelectionOnClick
          processRowUpdate={async (newRow, oldRow) => {
            // Check for changes in first_name, last_name (from name field), email, or phone
            let updatePayload: any = {};
            let hasChanges = false;

            if (newRow.first_name !== oldRow.first_name) {
              updatePayload.first_name = newRow.first_name;
              hasChanges = true;
            }
            if (newRow.last_name !== oldRow.last_name) {
              updatePayload.last_name = newRow.last_name;
              hasChanges = true;
            }
            if (newRow.email !== oldRow.email) {
              // Basic email validation
              if (newRow.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newRow.email)) {
                alert('Please enter a valid email address');
                return oldRow;
              }
              updatePayload.email = newRow.email;
              hasChanges = true;
            }
            if (newRow.phone !== oldRow.phone) {
              updatePayload.phone = newRow.phone;
              hasChanges = true;
            }

            if (hasChanges) {
              try {
                const res = await authManager.authenticatedFetch(`${baseDomain}/api/contacts/${newRow.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updatePayload),
                });
                
                if (!res.ok) {
                  const err = await res.json();
                  alert(err.error || 'Update failed');
                  return oldRow; // Revert to old row
                }
                
                // Update local state with the new data
                setRows(prevRows => 
                  prevRows.map(row => 
                    row.id === newRow.id ? { ...row, ...updatePayload } : row
                  )
                );
              } catch (error) {
                alert('Failed to update contact');
                return oldRow; // Revert to old row
              }
            }

            return newRow;
          }}
          onProcessRowUpdateError={(error) => {
            console.error('Row update error:', error);
          }}
          paginationModel={{ page: Math.floor(offset / limit), pageSize: limit }}
          pageSizeOptions={[limit]}
          hideFooterPagination
          autoHeight
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': { 
              bgcolor: '#f8f9fa', 
              fontWeight: 600,
              fontSize: '0.875rem',
              color: '#374151',
              borderBottom: '2px solid #e5e7eb'
            },
            '& .MuiDataGrid-row': {
              '&:nth-of-type(even)': { bgcolor: '#fafafa' },
              '&:hover': { bgcolor: '#f0f7ff !important' },
            },
            '& .MuiDataGrid-cell': { 
              py: 2,
              fontSize: '0.875rem',
              color: '#4b5563',
              borderBottom: '1px solid #f3f4f6'
            },
            '& .MuiDataGrid-cell--editable': {
              cursor: 'text',
              '&:hover': {
                bgcolor: '#fffbeb !important',
                outline: '1px solid #fbbf24'
              }
            },
            '& .MuiDataGrid-footerContainer': { display: 'none' }
          }}
        />
      </Paper>

      {/* Footer */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" mt={3} spacing={2}>
        <Typography variant="body2" sx={{ color: '#666' }}>
          {selectedIds.length > 0 ? `${selectedIds.length} contact(s) selected` : 'No contacts selected'}
        </Typography>
        <Pagination
          count={Math.max(1, Math.floor(offset / limit) + (rows.length === limit ? 2 : 1))}
          page={Math.floor(offset / limit) + 1}
          onChange={(_, p) => setOffset((p - 1) * limit)}
          color="primary"
          shape="rounded"
          size="medium"
          sx={{
            '& .MuiPaginationItem-root': {
              fontWeight: 500
            }
          }}
        />
      </Stack>
    </Box>
  );
}