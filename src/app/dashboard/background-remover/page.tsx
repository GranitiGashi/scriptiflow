"use client";

import { useEffect, useState } from "react";
import { hasTierOrAbove } from "@/lib/permissions";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import authManager from "@/lib/auth";

type Job = { id: string; status: string; result_url?: string | null; error?: string | null };

export default function BackgroundRemoverPage() {
  const base = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const [images, setImages] = useState<string>("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [localPreviews, setLocalPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState<'preview' | 'full'>('full');
  const [assets, setAssets] = useState<any>({});
  const [advOpen, setAdvOpen] = useState(false);
  const [removebgOpts, setRemovebgOpts] = useState<any>({ type: 'car', shadow_type: 'car', format: 'auto', channels: 'rgba', bg_color: '' });
  const [useBgColor, setUseBgColor] = useState(false);
  const [useLogo, setUseLogo] = useState(true);
  const [useAccountBg, setUseAccountBg] = useState(false);

  async function enqueue() {
    setLoading(true);
    setError(null);
    try {
      const list = images.split(/\s+/).filter(Boolean).slice(0, 20);
      if (list.length === 0) throw new Error('Add at least one image URL');
      const res = await authManager.authenticatedFetch(`${base}/api/images/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ images: list, overlay_logo_first: useLogo, background: useAccountBg ? { type: 'template' } : { type: 'none' }, provider: 'removebg', quality, removebg: { ...removebgOpts, bg_color: useBgColor ? (removebgOpts.bg_color || '') : undefined } }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Failed to enqueue');
      const queued = (body?.queued || []) as string[];
      setJobs(queued.map(id => ({ id, status: 'queued' })));
    } catch (e: any) {
      setError(e?.message || 'Failed to enqueue');
    } finally {
      setLoading(false);
    }
  }

  async function uploadAndEnqueue() {
    setUploading(true);
    setError(null);
    try {
      if (!files.length) throw new Error('Select at least one file');
      const fd = new FormData();
      for (const f of files.slice(0, 50)) fd.append('files', f);
      // Include background + removebg + quality for server-side enqueueFromUpload
      fd.append('backgroundType', useAccountBg ? 'template' : 'none');
      fd.append('quality', quality);
      const removebgPayload: any = { ...removebgOpts };
      if (!useBgColor) delete removebgPayload.bg_color;
      fd.append('removebg', JSON.stringify(removebgPayload));
      const res = await authManager.authenticatedFetch(`${base}/api/images/upload`, {
        method: 'POST',
        body: fd,
      } as any);
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Failed to upload & enqueue');
      const queued = (body?.queued || []) as string[];
      setJobs(queued.map(id => ({ id, status: 'queued' })));
    } catch (e: any) {
      setError(e?.message || 'Failed to upload & enqueue');
    } finally {
      setUploading(false);
    }
  }

  function onFilesSelected(list: File[]) {
    setFiles(list.slice(0, 50));
    const urls = list.slice(0, 50).map(f => URL.createObjectURL(f));
    setLocalPreviews(urls);
  }

  function removeSelected(idx: number) {
    const next = files.slice();
    next.splice(idx, 1);
    setFiles(next);
    const nprev = localPreviews.slice();
    URL.revokeObjectURL(nprev[idx]);
    nprev.splice(idx, 1);
    setLocalPreviews(nprev);
  }

  async function refresh() {
    if (!jobs.length) return;
    try {
      const ids = jobs.map(j => j.id).join(',');
      const res = await authManager.authenticatedFetch(`${base}/api/images/status?ids=${encodeURIComponent(ids)}`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (res.ok) {
        const arr: Job[] = await res.json();
        const byId = new Map(arr.map(j => [j.id, j]));
        setJobs(jobs.map(j => byId.get(j.id) || j));
      }
    } catch {}
  }

  async function downloadAllZip() {
    try {
      const ids = jobs.filter(j => j.status === 'success').map(j => j.id);
      if (!ids.length) return;
      const url = `${base}/api/images/download-all?ids=${encodeURIComponent(ids.join(','))}`;
      const res = await authManager.authenticatedFetch(url, { method: 'GET' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to download');
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = 'processed-images.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      console.error(e);
    }
  }

  async function downloadJob(id: string) {
    try {
      const url = `${base}/api/images/download/${encodeURIComponent(id)}`;
      const res = await authManager.authenticatedFetch(url, { method: 'GET' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to download');
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `processed-${id}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      console.error(e);
    }
  }

  

  useEffect(() => {
    const t = setInterval(refresh, 2500);
    return () => clearInterval(t);
  }, [jobs]);

  useEffect(() => {
    // fetch assets to decide default of useAccountBg
    (async () => {
      try {
        const res = await authManager.authenticatedFetch(`${base}/api/settings/assets`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
        if (res.ok) {
          const a = await res.json();
          setAssets(a);
          if (a?.branded_template_url){
            setUseAccountBg(true);

            setRemovebgOpts((prev: any) => ({
              ...prev,
              bg_image_url: a.branded_template_url,
            }));
          } 
        }
      } catch {}
    })();
  }, []);

  // Client-side guard: Premium only
  const allowed = hasTierOrAbove('premium');
  if (!allowed) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
            This feature is available on the Premium plan. <Link href="/pricing" className="underline text-yellow-900 hover:text-yellow-800">View pricing</Link>.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold">Background Remover</h1>
              <p className="text-sm text-gray-600 mt-1">Paste image URLs, enqueue background removal with optional logo overlay.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={refresh} className="text-sm text-blue-600">Refresh</button>
              <div className="text-sm">
                Quality:
                <select value={quality} onChange={e => setQuality(e.target.value as any)} className="ml-2 border rounded px-2 py-1">
                  <option value="preview">Preview (0.25 credits)</option>
                  <option value="full">Full (1 credit)</option>
                </select>
              </div>
              <label className="text-sm text-gray-700 flex items-center gap-2"><input type="checkbox" checked={useLogo} onChange={e => setUseLogo(e.target.checked)} /> Use logo on first image</label>
              <label className="text-sm text-gray-700 flex items-center gap-2"><input type="checkbox" checked={useAccountBg} onChange={e => setUseAccountBg(e.target.checked)} /> Use account background image</label>
              <label className="text-sm text-gray-700 flex items-center gap-2">
                <input type="checkbox" checked={useBgColor} onChange={e => setUseBgColor(e.target.checked)} /> Background color
                <input type="color" value={removebgOpts.bg_color ? `#${removebgOpts.bg_color.replace('#','')}` : '#ffffff'} onChange={e => setRemovebgOpts({ ...removebgOpts, bg_color: e.target.value.replace('#','') })} disabled={!useBgColor} className="h-6 w-10" />
              </label>
              {/* <button onClick={() => setAdvOpen(v => !v)} className="text-sm text-gray-700 underline">{advOpen ? 'Hide' : 'Advanced'}</button> */}
            </div>
          {/* {advOpen && (
            <div className="mt-3 p-3 border rounded grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div>
                <label className="block mb-1 text-gray-600">Type</label>
                <select value={removebgOpts.type || 'car'} onChange={e => setRemovebgOpts({ ...removebgOpts, type: e.target.value })} className="w-full border rounded px-2 py-1">
                  <option value="car">car</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-gray-600">Format</label>
                <select value={removebgOpts.format || 'auto'} onChange={e => setRemovebgOpts({ ...removebgOpts, format: e.target.value })} className="w-full border rounded px-2 py-1">
                  <option value="auto">auto</option>
                  <option value="png">png</option>
                  <option value="jpg">jpg</option>
                  <option value="webp">webp</option>
                  <option value="zip">zip</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-gray-600">Channels</label>
                <select value={removebgOpts.channels || 'rgba'} onChange={e => setRemovebgOpts({ ...removebgOpts, channels: e.target.value })} className="w-full border rounded px-2 py-1">
                  <option value="rgba">rgba</option>
                  <option value="alpha">alpha</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-gray-600">Shadow Type</label>
                <select value={removebgOpts.shadow_type || 'car'} onChange={e => setRemovebgOpts({ ...removebgOpts, shadow_type: e.target.value })} className="w-full border rounded px-2 py-1">
                  <option value="car">car</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-gray-600">Shadow Opacity</label>
                <input type="number" min={0} max={100} value={removebgOpts.shadow_opacity || ''} onChange={e => setRemovebgOpts({ ...removebgOpts, shadow_opacity: e.target.value ? Number(e.target.value) : undefined })} className="w-full border rounded px-2 py-1" />
              </div>
             
              <div className="md:col-span-2">
                <label className="block mb-1 text-gray-600">ROI (e.g. 0% 0% 100% 100%)</label>
                <input type="text" placeholder="0% 0% 100% 100%" value={removebgOpts.roi || ''} onChange={e => setRemovebgOpts({ ...removebgOpts, roi: e.target.value })} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block mb-1 text-gray-600">Crop</label>
                <select value={removebgOpts.crop ? 'true' : 'false'} onChange={e => setRemovebgOpts({ ...removebgOpts, crop: e.target.value === 'true' })} className="w-full border rounded px-2 py-1">
                  <option value="false">false</option>
                  <option value="true">true</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-gray-600">Crop Margin</label>
                <input type="text" placeholder="10% or 30px" value={removebgOpts.crop_margin || ''} onChange={e => setRemovebgOpts({ ...removebgOpts, crop_margin: e.target.value })} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block mb-1 text-gray-600">Scale</label>
                <input type="text" placeholder="original or 90%" value={removebgOpts.scale || ''} onChange={e => setRemovebgOpts({ ...removebgOpts, scale: e.target.value })} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block mb-1 text-gray-600">Position</label>
                <input type="text" placeholder="center or 50% 50%" value={removebgOpts.position || ''} onChange={e => setRemovebgOpts({ ...removebgOpts, position: e.target.value })} className="w-full border rounded px-2 py-1" />
              </div>
            </div>
          )} */}
          </div>

          <textarea
            value={images}
            onChange={e => setImages(e.target.value)}
            placeholder="Paste one image URL per line (max 20)"
            className="w-full border rounded p-3 h-32"
          />
          <div className="mt-3">
            <button onClick={enqueue} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">
              {loading ? 'Enqueuing…' : 'Enqueue'}
            </button>
          </div>

          <div className="mt-6 border-t pt-4">
            <div className="text-sm text-gray-600 mb-2">Or upload images (max 50)</div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onFilesSelected(Array.from(e.target.files || []))}
              className="block"
            />
            {files.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">Selected: {files.length} file(s)</div>
            )}
            {localPreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {localPreviews.map((url, i) => (
                  <div key={url} className="relative border rounded overflow-hidden">
                    <img src={url} className="w-full h-24 object-cover" />
                    <button onClick={() => removeSelected(i)} className="absolute top-1 right-1 bg-white/80 text-xs px-2 py-1 rounded">Remove</button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2">
              <button onClick={uploadAndEnqueue} disabled={uploading || files.length === 0} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60">
                {uploading ? 'Uploading…' : 'Upload & Enqueue'}
              </button>
            </div>
          </div>

          {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-3">Jobs</h2>
          {jobs.length === 0 ? (
            <div className="text-gray-600">No jobs yet.</div>
          ) : (
            <>
            <div className="mb-3">
              <button
                onClick={downloadAllZip}
                disabled={!jobs.some(j => j.status === 'success')}
                className="px-3 py-2 bg-gray-800 text-white rounded disabled:opacity-60"
              >
                Download All (ZIP)
              </button>
            </div>
            <div className="space-y-2">
              {jobs.map(j => (
                <div key={j.id} className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-800">{j.id}</div>
                      <div className="text-xs text-gray-500">Status: {j.status}</div>
                      {j.error && <div className="text-xs text-red-600">{j.error}</div>}
                    </div>
                    <div className="flex items-center gap-3">
                      {j.status !== 'success' && <div className="text-xs text-blue-600">Processing…</div>}
                      {j.result_url && (
                        <>
                          <a href={j.result_url} target="_blank" rel="noopener" className="text-sm text-blue-600">Open</a>
                          <button onClick={() => downloadJob(j.id)} className="text-sm text-gray-700">Download</button>
                        </>
                      )}
                    </div>
                  </div>
                  {j.result_url && (
                    <div className="mt-2">
                      <img src={j.result_url} className="w-full max-h-64 object-contain bg-transparent" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}


