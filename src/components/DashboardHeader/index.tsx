// components/DashboardHeader.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HelpCircle } from 'lucide-react';
import authManager from '@/lib/auth';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen?: boolean;
}

const DashboardHeader: React.FC<HeaderProps> = ({ onToggleSidebar, sidebarOpen = false }) => {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    try {
      setUser(authManager.getCurrentUser());
    } catch {}
  }, []);

  const fullName = user?.full_name || user?.name || user?.email || 'User';
  const companyName = user?.company_name || 'Your Dealership';
  const avatarLetter = String(fullName || 'U').charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 shadow-sm z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="w-9 h-9 flex items-center justify-center rounded-md border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle sidebar"
          title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? (
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Help menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 rounded-full border-none hover:bg-gray-200 text-gray-500"
              aria-label="Help"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/support">Help Center</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/support">Customer Support</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full hover:bg-gray-200 px-2 py-1">
              <span className="hidden sm:block text-gray-800 text-md font-medium">{fullName}</span>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar_url || user?.profile_picture || ''} alt={fullName} />
                <AvatarFallback>{avatarLetter}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>{companyName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Account Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                authManager.logout();
              }}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
