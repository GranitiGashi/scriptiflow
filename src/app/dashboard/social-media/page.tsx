'use client';

import dynamic from 'next/dynamic';
import { getUserTier } from '@/lib/permissions';
import DashboardLayout from '@/components/DashboardLayout';

const Integrations = dynamic(() => import('@/components/Integrations'), { ssr: false });

export default function Page() {
  const tier = getUserTier();
  const lockedStripeBanner = (
    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
      Stripe ist im Basic-Paket gesperrt. Bitte upgraden, um Zugriff zu erhalten.
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto w-full">
        {tier === 'basic' && lockedStripeBanner}
        <Integrations />
      </div>
    </DashboardLayout>
  );
}