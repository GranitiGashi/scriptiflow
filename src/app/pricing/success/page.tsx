'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';

export default function PricingSuccessPage() {
  return (
    <DashboardLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 max-w-md text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="text-2xl font-semibold mb-2">Zahlung erfolgreich</h1>
          <p className="text-gray-700 mb-4">Wir haben Ihnen eine E‑Mail mit einem Link zum Setzen Ihres Passworts geschickt.</p>
          <p className="text-sm text-gray-600 mb-6">Bitte prüfen Sie Ihren Posteingang (und ggf. den Spam‑Ordner).</p>
          <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Zum Login</Link>
        </div>
      </div>
    </DashboardLayout>
  );
}


