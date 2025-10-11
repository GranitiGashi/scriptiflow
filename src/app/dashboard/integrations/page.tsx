'use client';

import dynamic from 'next/dynamic';
import { getUserTier } from '@/lib/permissions';

const Integrations = dynamic(() => import('@/components/Integrations'), { ssr: false });

export default function Page() {
  const tier = getUserTier();
  const lockedFeaturesBanner = (
    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
      To access all features, please upgrade your package.{' '}
      <a href="/pricing" className="underline text-yellow-900 hover:text-yellow-800">View pricing</a>.
    </div>
  );

  return (
      <div className="max-w-6xl mx-auto w-full">
        {tier === 'basic' && lockedFeaturesBanner}
        <Integrations />
      </div>
  );
}