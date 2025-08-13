"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

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

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  const staticNavItems: NavItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: "fas fa-tachometer-alt" },
    { name: "Support", path: "/support", icon: "fas fa-life-ring" },
    // { name: 'Social Media', path: '/socialMedia', icon: 'fab fa-facebook'},
    // { name: 'My Inventory', path: '/dashboard/inventory', icon: 'fab fa-facebook'},
  ];

  const navMap: Record<string, NavItem[]> = {
    admin: [
      { name: "Register", path: "/Admin/register/", icon: "fas fa-users" },
    ],
    client: [
      { name: "Social Media", path: "/socialMedia", icon: "fab fa-facebook" },
      {name: "My Inventory", path: "/dashboard/inventory",icon: "fab fa-facebook"},
    ],
  };

  const navItems: NavItem[] = [
    ...staticNavItems,
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
      {/* Close Button at top right inside sidebar */}
      <button
        onClick={onClose}
        aria-label="Close sidebar"
        className="absolute top-4 right-4 text-white text-2xl focus:outline-none"
      >
        ×
      </button>

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
