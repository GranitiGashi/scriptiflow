'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import React from 'react';
import { FaBars } from 'react-icons/fa';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

function formatTitle(path: string) {
  const segments = path.split('/').filter(Boolean);
  const last = segments[segments.length - 1] || '';
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(last);
  if (isUUID) return '';
  return last.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const pathname = usePathname() || '/';
  const pageTitle = useMemo(() => formatTitle(pathname), [pathname]);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('role');
      setRole(storedRole);
    }
  }, []);

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <button
          className="md:hidden text-gray-700"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          {/* Use size and color props instead of className */}
          <FaBars size={24} color="#4B5563" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-[#111]">{pageTitle}</h1>
      </div>

      <div className="flex items-center space-x-3">
        <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 10a4 4 0 100-8 4 4 0 000 8zM2 18a8 8 0 0116 0H2z" />
        </svg>
        <span className="text-sm sm:text-base text-[#111] whitespace-nowrap">
          Logged in as {role || 'User'}
        </span>
      </div>
    </header>
  );
};

export default Header;
