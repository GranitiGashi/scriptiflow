"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getUserTier } from "@/lib/permissions";
import authManager from '@/lib/auth';
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

interface NavItem {
  name: string;
  path: string;
  icon: string;
  external?: boolean;
  disabled?: boolean;
}

interface NavGroup {
  name: string;
  icon: string;
  items: NavItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onToggle }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [dealerLogoUrl, setDealerLogoUrl] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
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

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  // Standalone items (not in groups)
  const standaloneItems: NavItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: "fas fa-tachometer-alt" },
  ];

  // Define navigation groups
        const tier = getUserTier();
        const isPro = tier === 'pro' || tier === 'premium';
        const isPremium = tier === 'premium';

  const navGroupsMap: Record<string, NavGroup> = {
    socialMedia: {
      name: "Social Media",
      icon: "fas fa-share-nodes",
      items: [
        // { name: "Social Posts", path: "/dashboard/social", icon: "fas fa-share-nodes" },
        ...(isPro ? [{ name: "Posts Monitor", path: "/dashboard/social-posts", icon: "fas fa-chart-line" }] : []),
        { name: "Autopost", path: "/dashboard/integrations/autopost", icon: "fas fa-bolt" },
        { name: "My Inventory", path: "/dashboard/inventory", icon: "fas fa-car" },
      ]
    },
    crm: {
      name: "CRM",
      icon: "fas fa-address-book",
      items: [
        ...(isPro ? [{ name: "Contacts", path: "/dashboard/contacts", icon: "fas fa-address-book" }] : []),
        ...(isPro ? [{ name: "Calendar", path: "/dashboard/calendar", icon: "fas fa-calendar" }] : []),
      ]
    },
    communications: {
      name: "Communications",
      icon: "fas fa-comments",
      items: [
        ...(isPremium ? [{ name: "WhatsApp Inbox", path: "/dashboard/inbox", icon: "fas fa-inbox" }] : []),
        ...(isPro ? [{ name: "Email Inbox", path: "/dashboard/email-inbox", icon: "fas fa-envelope" }] : []),
      ]
    },
    integrations: {
      name: "Integrations",
      icon: "fas fa-plug",
      items: [
        { name: "All Integrations", path: "/dashboard/integrations", icon: "fas fa-plug" },
      ]
    },
    tools: {
      name: "Tools",
      icon: "fas fa-tools",
      items: [
        { 
          name: isPremium ? "Background Remover" : "Background Remover 🔒", 
          path: "/dashboard/background-remover", 
          icon: "fas fa-cut", 
          disabled: !isPremium 
        },
      ]
    },
    account: {
      name: "Account",
      icon: "fas fa-user-circle",
      items: [
        ...(isPremium ? [{ name: "Credits", path: "/dashboard/credits", icon: "fas fa-coins" }] : []),
        { name: "Support", path: "/support", icon: "fas fa-life-ring" },
      ]
    },
  };

  // Admin navigation
  const adminGroups: Record<string, NavGroup> = {
    admin: {
      name: "Administration",
      icon: "fas fa-crown",
      items: [
        { name: "Admin Dashboard", path: "/dashboard/admin", icon: "fas fa-chart-bar" },
        { name: "Add Apps", path: "/dashboard/admin/apps", icon: "fas fa-cubes" },
        { name: "Register Users", path: "/Admin/register/", icon: "fas fa-users" },
        { name: "Support Tickets", path: "/dashboard/admin/support", icon: "fas fa-headset" },
      ]
    },
  };

  // Filter out empty groups
  const activeGroups = Object.entries(role === 'admin' ? adminGroups : navGroupsMap)
    .filter(([_, group]) => group.items.length > 0)
    .reduce((acc, [key, group]) => ({ ...acc, [key]: group }), {} as Record<string, NavGroup>);

  // Auto-open groups that contain the current path
  useEffect(() => {
    const newOpenGroups: Record<string, boolean> = {};
    const groupsToCheck = role === 'admin' ? adminGroups : navGroupsMap;
    Object.entries(groupsToCheck).forEach(([groupName, group]) => {
      const hasActivePath = group.items.some(item => pathname === item.path || pathname.startsWith(item.path + '/'));
      if (hasActivePath) {
        newOpenGroups[groupName] = true;
      }
    });
    setOpenGroups(prev => ({ ...prev, ...newOpenGroups }));
  }, [pathname, role]);

  // Keyboard shortcut to close sidebar (ESC key)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Swipe gesture support for mobile
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const swipeDistance = touchEndX - touchStartX;
      // Swipe left to close (when open)
      if (swipeDistance < -50 && isOpen) {
        onClose();
      }
    };

    const sidebar = document.querySelector('aside');
    if (sidebar && window.innerWidth < 768) {
      sidebar.addEventListener('touchstart', handleTouchStart);
      sidebar.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        sidebar.removeEventListener('touchstart', handleTouchStart);
        sidebar.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mini Sidebar - Icons Only (Desktop) */}
      {!isOpen && (
        <aside
          className="hidden md:block fixed top-0 left-0 h-full w-16 bg-white border-r border-gray-200 shadow-sm z-40"
        >
        <div className="flex flex-col items-center pt-6 space-y-1">
          {/* Dashboard Icon */}
          {role !== 'admin' && (
            <div className="relative group/item">
              <Link
                href="/dashboard"
                className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-200 ${
                  pathname === '/dashboard'
                    ? "bg-blue-600 text-white"
                    : "text-black hover:bg-gray-100"
                }`}
              >
                <i className="fas fa-tachometer-alt text-xl" />
              </Link>
              {/* Tooltip */}
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 pointer-events-none">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-2 px-3 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-700">Dashboard</span>
                </div>
              </div>
            </div>
          )}

          {/* Group Icons with Hover Dropdowns */}
          {Object.entries(activeGroups).map(([groupKey, group]) => {
            const hasActiveItem = group.items.some(item => 
              pathname === item.path || pathname.startsWith(item.path + '/')
            );
            
            return (
              <div key={groupKey} className="relative group/item">
                <button
                  onClick={() => {
                    if (onToggle) {
                      onToggle();
                      setTimeout(() => toggleGroup(groupKey), 100);
                    }
                  }}
                  className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-200 ${
                    hasActiveItem
                      ? "bg-blue-100 text-blue-600"
                      : "text-black hover:bg-gray-100"
                  }`}
                >
                  <i className={`${group.icon} text-xl`} />
                </button>
                
                {/* Hover Dropdown Menu */}
                <div className="absolute left-full ml-2 top-0 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 z-50">
                  <div className="bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px]">
                    {/* Group Title */}
                    <div className="px-4 py-2 border-b border-gray-100">
                      <span className="text-sm font-semibold text-gray-700">{group.name}</span>
                    </div>
                    
                    {/* Group Items */}
                    <div className="py-1">
                      {group.items.map((item) => (
                        <Link
                          key={item.name}
                          href={item.path}
                          onClick={(e) => {
                            if (item.disabled) {
                              e.preventDefault();
                              router.push('/pricing');
                            }
                          }}
                          className={`flex items-center px-4 py-2 text-sm transition-colors ${
                            pathname === item.path
                              ? "bg-blue-50 text-blue-600 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <i className={`${item.icon} mr-3 text-sm w-4 text-center`} />
                          <span>{item.name}</span>
                          {item.disabled && (
                            <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">
                              Pro
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>
      )}

      {/* Main Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg z-50
          transform transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >

      {/* Close button for mobile */}
      <button
        onClick={onClose}
        className="md:hidden absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200 text-gray-600"
        aria-label="Close sidebar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {dealerLogoUrl && (
        <div className="mb-4 p-4 relative pt-6 border-b border-gray-100">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <img
            src={dealerLogoUrl}
            alt="Dealership Logo"
              className="w-auto h-12 object-contain mx-auto"
          />
          </div>
        </div>
      )}

      <nav className="overflow-y-auto h-[calc(100vh-120px)] custom-scrollbar px-3 relative">
        <ul className="space-y-1">
          {/* Standalone Items */}
          {role !== 'admin' && standaloneItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.path}
                onClick={onClose}
                className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  pathname === item.path 
                    ? "bg-blue-600 text-white shadow-sm" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <i className={`${item.icon} mr-3 text-base w-5 text-center`} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            </li>
          ))}

          {/* Grouped Items with Dropdowns */}
          {Object.entries(activeGroups).map(([groupKey, group]) => {
            const isOpen = openGroups[groupKey];
            const hasActiveItem = group.items.some(item => 
              pathname === item.path || pathname.startsWith(item.path + '/')
            );

            return (
              <li key={groupKey}>
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(groupKey)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    hasActiveItem 
                      ? "bg-gray-100 text-blue-600" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center">
                    <i className={`${group.icon} text-sm mr-3 w-5 text-center`} />
                    <span className="font-semibold text-sm">{group.name}</span>
                  </div>
                  <div className={`transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`}>
                    <FaChevronDown className={`text-xs ${hasActiveItem ? 'text-blue-600' : 'text-gray-400'}`} />
                  </div>
                </button>

                {/* Group Items */}
                {isOpen && (
                  <ul className="mt-1 ml-5 space-y-0.5 border-l-2 border-gray-200 pl-3 animate-slideDown">
                    {group.items.map((item) => (
                      <li key={item.name}>
                        {item.external ? (
                          <a
                            href={item.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={onClose}
                            className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 relative ${
                              pathname === item.path
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-gray-600 hover:bg-gray-50"
                            } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <i className={`${item.icon} mr-2.5 text-xs w-4 text-center`} />
                            <span className="font-medium">{item.name}</span>
                            {item.disabled && (
                              <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md font-semibold">
                                Pro
                              </span>
                            )}
                          </a>
                        ) : (
                          <Link
                            href={item.path}
                            prefetch={item.path !== '/dashboard/calendar'}
                            onClick={(e) => {
                              if (item.disabled) {
                                e.preventDefault();
                                router.push('/pricing');
                                return;
                              }
                              onClose();
                            }}
                            className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 relative ${
                              pathname === item.path
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-gray-600 hover:bg-gray-50"
                            } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <i className={`${item.icon} mr-2.5 text-xs w-4 text-center`} />
                            <span className="font-medium">{item.name}</span>
                            {item.disabled && (
                              <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md font-semibold">
                                Pro
                              </span>
                            )}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(209, 213, 219, 0.5) transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(209, 213, 219, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.15s ease-out;
        }
      `}</style>
      </aside>
    </>
  );
};

export default Sidebar;
