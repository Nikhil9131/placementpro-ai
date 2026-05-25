'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { Flame, Bell, Check, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { profile, notifications, fetchNotifications } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);

  const getPageTitle = () => {
    switch (pathname) {
      case '/dashboard':
        return 'Overview';
      case '/aptitude':
        return 'Aptitude Prep';
      case '/dsa':
        return 'DSA Tracker';
      case '/resume':
        return 'AI Resume Analyzer';
      case '/interview':
        return 'Mock Interviews';
      case '/planner':
        return 'AI Study Planner';
      case '/roadmaps':
        return 'Company Roadmaps';
      case '/profile':
        return 'My Profile';
      case '/admin':
        return 'Platform Analytics';
      default:
        return 'PlacementPro AI';
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      await fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.delete('/notifications/clear');
      await fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 border-b border-slate-800 bg-dark-900/40 backdrop-blur-md px-6 flex items-center justify-between z-40 relative">
      {/* Title */}
      <h1 className="text-lg font-semibold text-slate-100">{getPageTitle()}</h1>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Streak Counter */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-orange-600/10 border border-orange-500/20 text-orange-400">
          <Flame className="h-4.5 w-4.5 fill-orange-500 animate-pulse" />
          <span className="text-xs font-bold">{profile?.streak || 0} Day Streak</span>
        </div>

        {/* Notifications Icon & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 transition-colors duration-150 relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500"></span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
                <span className="text-xs font-bold text-slate-300">Notifications ({unreadCount})</span>
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">No new notifications</div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-3 border-b border-slate-800 flex justify-between items-start transition-colors duration-150 hover:bg-slate-800/20 ${
                        !notification.read ? 'bg-indigo-950/5' : ''
                      }`}
                    >
                      <div className="flex-1 mr-2">
                        <p className="text-xs font-semibold text-slate-200">{notification.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkRead(notification._id)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-400"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
