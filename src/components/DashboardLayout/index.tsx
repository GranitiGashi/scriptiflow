'use client';

import React, { ReactNode, useState } from 'react';
import Sidebar from '../SideBar';
import Header from '../DashboardHeader';

interface LayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Content Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Header with toggle button */}
        <Header onToggleSidebar={toggleSidebar} />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>

        {/* Overlay for any screen */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}
