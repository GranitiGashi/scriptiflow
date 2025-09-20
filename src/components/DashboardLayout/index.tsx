'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authManager from '@/lib/auth';
import Sidebar from '../SideBar';
import Header from '../DashboardHeader';

interface LayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true); // open by default
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
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Content Area */}
      <div
        className={`
          flex-1 flex flex-col relative transition-all duration-300
          ${sidebarOpen ? 'ml-64' : 'ml-0'}
        `}
      >
        {/* Header with toggle button */}
        <Header onToggleSidebar={toggleSidebar} />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

        {/* Overlay for small screens */}
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
