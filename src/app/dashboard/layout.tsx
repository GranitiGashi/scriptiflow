'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authManager from '@/lib/auth';
import Sidebar from '@/components/SideBar';
import Header from '@/components/DashboardHeader';

export default function DashboardRootLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const token = await authManager.getValidAccessToken();
        if (!token) {
          router.push('/login');
          return;
        }
        if (isMounted) setAuthorized(true);
      } catch {
        router.push('/login');
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div
        className={`
          flex-1 flex flex-col relative transition-all duration-300
          ${sidebarOpen ? 'ml-64' : 'ml-0'}
        `}
      >
        <Header onToggleSidebar={toggleSidebar} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}


