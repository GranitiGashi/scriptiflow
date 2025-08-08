'use client';

import dynamic from 'next/dynamic';

const Integrations = dynamic(() => import('@/components/Integrations'), { ssr: false });

export default function Page() {
  return <Integrations />;
}