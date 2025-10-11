"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setError(null);
    try {
      const payload: any = { email };
      // If CAPTCHA is enabled on backend, you can attach token here
      // payload.captcha_token = (window as any).captchaToken || undefined;
      const res = await fetch(`${baseDomain}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      // Always show success to avoid enumeration
      setStatus('If an account exists, a recovery email has been sent.');
      setEmail('');
    } catch (e: any) {
      // Show generic status regardless of error
      setStatus('If an account exists, a recovery email has been sent.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h1 className="text-xl font-semibold mb-4">Forgot Password</h1>
        <p className="text-sm text-gray-600 mb-4">Enter your email and we will send you a link to reset your password.</p>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">{loading ? 'Sending...' : 'Send reset link'}</button>
        </form>
        {status && <div className="mt-3 text-green-700 text-sm">{status}</div>}
        {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
      </div>
    </div>
  );
}


