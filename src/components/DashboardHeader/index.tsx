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
}

const DashboardHeader: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
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
    <header className="flex items-center justify-between bg-gray-100 px-4 py-3 shadow z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="text-gray-800 text-xl focus:outline-none"
          aria-label="Toggle sidebar"
        >
          ☰
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
