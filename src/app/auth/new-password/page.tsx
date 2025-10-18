"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function NewPasswordPage() {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
        // Store tokens only in memory during this tab session
        try {
          (window as any).__pw_tmp_access = access;
          (window as any).__pw_tmp_refresh = refresh;
          if (expiresAt) (window as any).__pw_tmp_expires = expiresAt;
        } catch {}
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
      const access = (typeof window !== 'undefined' ? (window as any).__pw_tmp_access : null) as string | null;
      const refresh = (typeof window !== 'undefined' ? (window as any).__pw_tmp_refresh : null) as string | null;
      if (!access || !refresh) {
        setError('Missing session. Use the email link from your inbox.');
        setLoading(false);
        return;
      }
      const sp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : undefined;
      const mode = sp ? (sp.get('mode') || undefined) : undefined;
      const state = sp ? (sp.get('state') || undefined) : undefined;
      const res = await fetch(`${baseDomain}/api/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${access}`, 'x-refresh-token': refresh },
        body: JSON.stringify({ password, mode, state }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to set password');
      }
      setStatus('Password updated. You can now log in.');
      // Clear temporary tokens from memory only
      try { (window as any).__pw_tmp_access = null; (window as any).__pw_tmp_refresh = null; (window as any).__pw_tmp_expires = null; } catch {}
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
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10" placeholder="Min 12 chars, upper, lower, number, symbol" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <div className="relative">
              <input type={showConfirm ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10" />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
              >
                {showConfirm ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">{loading ? 'Saving...' : 'Save password'}</button>
        </form>
        {status && <div className="mt-3 text-green-700 text-sm">{status}</div>}
        {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
      </div>
    </div>
  );
}


