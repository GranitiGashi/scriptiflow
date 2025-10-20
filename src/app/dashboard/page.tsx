'use client';
import React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import authManager from '@/lib/auth';

const Dashboard: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);
    if (storedRole === 'admin') {
      window.location.href = '/dashboard/admin';
    }

    try {
      const currentUser = authManager.getCurrentUser();
      setUser(currentUser);
      
      // Set greeting based on time of day
      const hour = new Date().getHours();
      if (hour < 12) setGreeting('Good morning');
      else if (hour < 18) setGreeting('Good afternoon');
      else setGreeting('Good evening');
    } catch {}
  }, []);

  const fullName = user?.full_name || user?.name || 'User';
  const firstName = fullName.split(' ')[0];

  return (
    <div className="min-h-screen bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
      {/* Greeting Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          {greeting}, {firstName}
        </h1>
      </div>

      {/* Today's Highlights */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Today's Highlights</h2>
            <span className="px-3 py-1 bg-black text-white text-sm font-semibold rounded-full">
              0
            </span>
          </div>
          <Link href="/dashboard/calendar" className="text-base font-medium text-gray-900 hover:text-gray-600 flex items-center gap-2 transition-colors">
            Calendar
            <i className="fas fa-arrow-right text-sm"></i>
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {/* Empty state */}
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-calendar-day text-2xl text-gray-400"></i>
              </div>
              <p className="text-gray-500 text-base mb-1">No highlights for today</p>
              <p className="text-sm text-gray-400">Your tasks and events will appear here</p>
            </div>
          </div>
        </div>
      </div>

      {/* To Market Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">To Market</h2>
          <Link href="/dashboard/market" className="text-base font-medium text-gray-900 hover:text-gray-600 flex items-center gap-2 transition-colors">
            View All
            <i className="fas fa-arrow-right text-sm"></i>
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex flex-col items-center justify-center text-center py-8">
            {/* Bot Icon */}
            <div className="mb-8">
              <svg className="w-20 h-20 text-gray-800" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="25" y="35" width="50" height="35" rx="8" />
                <circle cx="40" cy="50" r="3" fill="currentColor" />
                <circle cx="60" cy="50" r="3" fill="currentColor" />
                <path d="M 35 62 Q 50 68 65 62" strokeLinecap="round" />
                <line x1="50" y1="20" x2="50" y2="35" strokeLinecap="round" />
                <circle cx="50" cy="18" r="3" fill="currentColor" />
              </svg>
            </div>

            {/* Input Field */}
            <div className="w-full max-w-2xl">
              <input
                type="text"
                placeholder="What can I do for you today?"
                className="w-full px-6 py-4 text-gray-500 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              
              {/* Quick Actions */}
              <div className="flex items-center gap-3 mt-4 justify-center flex-wrap">
                <button className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <i className="fas fa-cog"></i>
                  Services
                </button>
                <button className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  /Listing
                </button>
                <button className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  #Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      </div>
    </div>
  );
};

export default Dashboard;