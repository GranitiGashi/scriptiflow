'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';


interface NavItem {
  name: string;
  path: string;
  icon: string;
}

interface SidebarProps {
  isOpen: boolean;      // passed from DashboardLayout (not strictly needed inside, but keeps types consistent)
  onClose: () => void;  // close handler for mobile
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const router = useRouter();
  const pathname = usePathname();      // current route
  const [role, setRole] = useState<string | null>(null);

  /* ──────────────────────────────────────────
     get role from localStorage (client‑side)
  ─────────────────────────────────────────── */
  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);
  }, []);

  /* ──────────────────────────────────────────
     navigation map per role
  ─────────────────────────────────────────── */
  const navMap: Record<string, NavItem[]> = {
    admin: [
      { name: 'All Sessions', path: '/Admin/Sessions', icon: 'fas fa-users' },
    ],
    client: [
      { name: 'Water Tracer', path: '/WaterTracer', icon: 'fas fa-calendar-alt' },
    ],
  };

  const navItems = role ? navMap[role] ?? [] : [];

  /* ──────────────────────────────────────────
     render
  ─────────────────────────────────────────── */
  return (
    <>
      {/* mobile close bar */}
      <div className="flex justify-between items-center md:hidden mb-4">
        <h2 className="text-xl font-bold capitalize">{role ?? 'User'} Panel</h2>
        <button onClick={onClose} aria-label="Close sidebar">
          <FaTimes size={24} />
        </button>
      </div>

      {/* desktop title */}
      <h2 className="hidden md:block text-2xl font-bold mb-8 capitalize">
        {role ?? 'User'} Panel
      </h2>

      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-4">
              <Link
                href={item.path}
                className={`flex items-center hover:text-gray-300 ${
                  pathname === item.path ? 'text-blue-400' : ''
                }`}
                onClick={onClose} // close on mobile tap
              >
                <i className={`${item.icon} mr-2`} />
                {item.name}
              </Link>
            </li>
          ))}

          {/* logout */}
          <li className="mb-4">
            <button
              onClick={() => {
                localStorage.clear();
                router.push('/login');
              }}
              className="flex items-center hover:text-gray-300"
            >
              <i className="fas fa-sign-out-alt mr-2" />
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Sidebar;
