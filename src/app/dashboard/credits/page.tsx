"use client";

import { useEffect, useState } from "react";
import authManager from "@/lib/auth";

export default function CreditsPage() {
  const base = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const [balance, setBalance] = useState<number>(0);
  const [amount, setAmount] = useState<string>('10');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      const res = await authManager.authenticatedFetch(`${base}/api/credits/balance`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (res.ok) {
        const b = await res.json();
        setBalance(b.balance_milli || 0);
      }
    } catch {}
  }

  async function topUp() {
    setLoading(true);
    setMsg(null); setErr(null);
    try {
      const res = await authManager.authenticatedFetch(`${base}/api/credits/top-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ amount_eur: parseFloat(amount) }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Failed to top up');
      setMsg(`Added €${parseFloat(amount).toFixed(2)} to credits`);
      setAmount('10');
      await load();
    } catch (e: any) {
      setErr(e?.message || 'Failed to top up');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h1 className="text-xl font-semibold">Credits</h1>
          <p className="text-sm text-gray-600 mt-1">Pay-per-image background removal. 1 image ≈ €0.25 by default.</p>

          <div className="mt-4 flex items-center gap-6">
            <div>
              <div className="text-sm text-gray-500">Balance</div>
              <div className="text-2xl font-semibold">€{(balance/1000).toFixed(2)}</div>
            </div>
            <div className="flex items-end gap-2">
              <div>
                <div className="text-sm text-gray-500">Top up amount (€)</div>
                <input value={amount} onChange={e => setAmount(e.target.value)} className="border rounded px-3 py-2 w-32" />
              </div>
              <button onClick={topUp} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">{loading ? 'Processing…' : 'Top up'}</button>
            </div>
          </div>

          {msg && <div className="mt-3 text-green-700 text-sm">{msg}</div>}
          {err && <div className="mt-3 text-red-600 text-sm">{err}</div>}
        </div>
      </div>
  );
}


