'use client';

import { useEffect, useState } from 'react';
import authManager from '@/lib/auth';

type Job = {
  id: string;
  platform: 'facebook' | 'instagram';
  mobile_ad_id?: string;
  payload?: any;
  status: 'queued' | 'posting' | 'success' | 'failed';
  attempts?: number;
  error?: string | null;
  created_at?: string;
  updated_at?: string;
  result?: any;
};

export default function SocialPostsPage() {
  const base = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const [tab, setTab] = useState<'queued' | 'posting' | 'success' | 'failed'>('queued');
  const [rows, setRows] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  async function load(status: 'queued' | 'posting' | 'success' | 'failed') {
    setLoading(true);
    try {
      const res = await authManager.authenticatedFetch(`${base}/api/social/posts?status=${encodeURIComponent(status)}&limit=100`);
      if (res.ok) setRows(await res.json()); else setRows([]);
    } catch { setRows([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(tab); }, [tab]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Social Posts</h1>
      <div className="flex items-center gap-2 mb-4">
        {(['queued','posting','success','failed'] as const).map(t => (
          <button key={t} onClick={()=>setTab(t)} className={`px-3 py-1.5 rounded ${tab===t?'bg-black text-white':'bg-white border'}`}>{t}</button>
        ))}
      </div>
      <div className="bg-white rounded border">
        <div className="grid grid-cols-12 gap-2 p-3 border-b text-xs text-gray-500">
          <div className="col-span-2">Created</div>
          <div className="col-span-2">Platform</div>
          {/* <div className="col-span-2">Ad ID</div> */}
          <div className="col-span-4">Caption</div>
          <div className="col-span-4">Images</div>
          <div className="col-span-2">Status</div>
        </div>
        {loading ? (
          <div className="p-4 text-sm">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">No records.</div>
        ) : rows.map(j => {
          const caption = j?.payload?.caption || '';
          const imgs = Array.isArray(j?.payload?.images) ? j.payload.images : [];
          const link = j.platform === 'facebook' ? (j as any)?.result?.permalink_url : (j as any)?.result?.permalink;
          return (
            <div key={j.id} className="grid grid-cols-12 gap-2 p-3 border-b text-sm items-center">
              <div className="col-span-2">{j.created_at ? new Date(j.created_at).toLocaleString() : '-'}</div>
              <div className="col-span-2 capitalize">{j.platform}</div>
              {/* <div className="col-span-2">{j.mobile_ad_id || '-'}</div> */}
              <div className="col-span-4">
                <div className="text-gray-800 line-clamp-1">{caption || '(no caption)'}</div>
                {link && (
                  <div className="mt-1 text-xs">
                    <a href={link} target="_blank" className="text-blue-600 underline">Open on {j.platform}</a>
                  </div>
                )}
              </div>
              <div className="col-span-4">
              {imgs.length > 0 && (
                  <div className="flex gap-1 mt-1 overflow-x-auto">
                    {imgs.slice(0, 6).map((u: string, i: number) => (
                      <img key={i} src={u} className="w-10 h-10 object-cover rounded border" />
                    ))}
                    {imgs.length > 6 && <div className="text-xs text-gray-500 self-center">+{imgs.length-6} more</div>}
                  </div>
                )}
              </div>
              <div className="col-span-2">
                <span className={`px-2 py-0.5 rounded text-xs ${j.status==='success'?'bg-green-100 text-green-700': j.status==='queued'?'bg-yellow-100 text-yellow-800': j.status==='posting'?'bg-blue-100 text-blue-700':'bg-red-100 text-red-700'}`}>{j.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


