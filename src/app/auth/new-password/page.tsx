"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewPasswordPage() {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Capture tokens from Supabase email link (#access_token=...&refresh_token=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash && hash.startsWith('#')) {
      const params = new URLSearchParams(hash.slice(1));
      const access = params.get('access_token');
      const refresh = params.get('refresh_token');
      const expiresAt = params.get('expires_at');
      if (access && refresh) {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        if (expiresAt) localStorage.setItem('expires_at', expiresAt);
        // Remove hash from URL
        try { window.history.replaceState(null, '', window.location.pathname); } catch {}
      }
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setError(null);
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const access = localStorage.getItem('access_token');
      const refresh = localStorage.getItem('refresh_token');
      if (!access || !refresh) {
        setError('Missing session. Use the email link from your inbox.');
        setLoading(false);
        return;
      }
      const mode = typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('mode') || undefined) : undefined;
      const res = await fetch(`${baseDomain}/api/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${access}`, 'x-refresh-token': refresh },
        body: JSON.stringify({ password, mode }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to set password');
      }
      setStatus('Password updated. You can now log in.');
      setTimeout(() => router.push('/login'), 1200);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h1 className="text-xl font-semibold mb-4">Set a new password</h1>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">{loading ? 'Saving...' : 'Save password'}</button>
        </form>
        {status && <div className="mt-3 text-green-700 text-sm">{status}</div>}
        {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
      </div>
    </div>
  );
}


