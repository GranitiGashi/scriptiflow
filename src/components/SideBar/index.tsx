"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getUserTier, hasTierOrAbove } from "@/lib/permissions";
import authManager from '@/lib/auth';

interface NavItem {
  name: string;
  path: string;
  icon: string;
  external?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [dealerLogoUrl, setDealerLogoUrl] = useState<string | null>(null);
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  useEffect(() => {
    async function loadAssets() {
      try {
        const res = await authManager.authenticatedFetch(`${baseDomain}/api/settings/assets`, {
          headers: { Accept: 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.dealer_logo_url) setDealerLogoUrl(data.dealer_logo_url);
        }
      } catch {}
    }
    loadAssets();
  }, []);

  const staticNavItems: NavItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: "fas fa-tachometer-alt" },
    { name: "Support", path: "/support", icon: "fas fa-life-ring" },
    // { name: 'Social Media', path: '/socialMedia', icon: 'fab fa-facebook'},
    // { name: 'My Inventory', path: '/dashboard/inventory', icon: 'fab fa-facebook'},
  ];

  const navMap: Record<string, NavItem[]> = {
    admin: [
      { name: "Admin Dashboard", path: "/dashboard/admin", icon: "fas fa-crown" },
      { name: "Add Apps", path: "/dashboard/admin/apps", icon: "fas fa-cubes" },
      { name: "Register", path: "/Admin/register/", icon: "fas fa-users" },
    ],
    client: (
      () => {
        const items: NavItem[] = [];
        // basic and above: integrations + autopost + inventory
        items.push({ name: "Integrations", path: "/dashboard/social-media", icon: "fab fa-facebook" });
        items.push({ name: "Autopost", path: "/dashboard/social-media/autopost", icon: "fas fa-bolt" });
        items.push({ name: "My Inventory", path: "/dashboard/inventory", icon: "fab fa-facebook"});
        items.push({ name: "Contacts", path: "/dashboard/contacts", icon: "fas fa-address-book"});
        items.push({ name: "Inbox", path: "/dashboard/inbox", icon: "fas fa-inbox"});
        items.push({ name: "Email Inbox", path: "/dashboard/email-inbox", icon: "fas fa-envelope"});
        items.push({ name: "Calendar", path: "/dashboard/calendar", icon: "fas fa-calendar"});
        items.push({ name: "Background Remover", path: "/dashboard/background-remover", icon: "fas fa-cut"});
        items.push({ name: "Credits", path: "/dashboard/credits", icon: "fas fa-coins"});
        items.push({ name: "Settings", path: "/dashboard/settings", icon: "fas fa-cog"});
        // premium only pages reserved (none yet)
        return items;
      }
    )(),
  };

  const filteredStatic = role === 'admin' ? staticNavItems.filter(item => item.name !== 'Dashboard') : staticNavItems;

  const navItems: NavItem[] = [
    ...filteredStatic,
    ...(role ? (navMap[role] ?? []) : []),
  ];

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-4 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {dealerLogoUrl && (
        <div className="mb-4">
          <img
            src={dealerLogoUrl}
            alt="Dealership Logo"
            className="w-16 h-16 object-contain bg-white rounded p-1"
          />
        </div>
      )}
      {/* Close Button at top right inside sidebar */}
      {/* <button
        onClick={onClose}
        aria-label="Close sidebar"
        className="absolute top-4 right-4 text-white text-2xl focus:outline-none"
      >
        
      </button> */}

      <h2 className="text-2xl font-bold mb-6 text-gray-100">
        {role ?? "User"} Panel
      </h2>
      <nav>
        <ul className="space-y-4">
          {navItems.map((item) => (
            <li key={item.name}>
              {item.external ? (
                <a
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className={`flex items-center hover:text-gray-300 ${
                    pathname === item.path ? "text-blue-400" : "text-gray-200"
                  }`}
                >
                  <i className={`${item.icon} mr-3 text-lg`} />
                  {item.name}
                </a>
              ) : (
                <Link
                  href={item.path}
                  onClick={onClose}
                  className={`flex items-center hover:text-gray-300 ${
                    pathname === item.path ? "text-blue-400" : "text-gray-200"
                  }`}
                >
                  <i className={`${item.icon} mr-3 text-lg`} />
                  {item.name}
                </Link>
              )}
            </li>
          ))}
          <li>
            <button
              onClick={() => {
                localStorage.clear();
                router.push("/login");
              }}
              className="flex items-center hover:text-gray-300 text-gray-200 w-full text-left"
            >
              <i className="fas fa-sign-out-alt mr-3 text-lg" />
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
