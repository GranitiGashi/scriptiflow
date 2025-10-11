"use client";

import { useEffect } from 'react';
import { initAnalytics, identifyUser, trackPageView } from '@/lib/analytics';
import { usePathname, useSearchParams } from 'next/navigation';

type Props = {
  children: React.ReactNode;
};

export default function AnalyticsProvider({ children }: Props) {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    initAnalytics();
    try {
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const userId: string | undefined = parsed?.id || parsed?.user?.id;
        const email: string | undefined = parsed?.email || parsed?.user?.email;
        identifyUser(userId || email || null, email ? { email } : undefined);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const url = typeof window !== 'undefined' ? window.location.origin + pathname + (search?.toString() ? `?${search.toString()}` : '') : pathname || '/';
    trackPageView(url);
    // Re-identify on navigation in case user just logged in during this SPA session
    try {
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const userId: string | undefined = parsed?.id || parsed?.user?.id;
        const email: string | undefined = parsed?.email || parsed?.user?.email;
        identifyUser(userId || email || null, email ? { email } : undefined);
      }
    } catch {}
  }, [pathname, search]);

  return <>{children}</>;
}


