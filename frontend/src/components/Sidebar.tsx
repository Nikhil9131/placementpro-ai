'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  Brain,
  Code2,
  FileText,
  UserSquare2,
  CalendarDays,
  Map,
  User,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Aptitude Portal', icon: Brain, path: '/aptitude' },
    { name: 'DSA Tracker', icon: Code2, path: '/dsa' },
    { name: 'Resume Analyzer', icon: FileText, path: '/resume' },
    { name: 'Mock Interview', icon: UserSquare2, path: '/interview' },
    { name: 'Study Planner', icon: CalendarDays, path: '/planner' },
    { name: 'Roadmaps', icon: Map, path: '/roadmaps' },
    { name: 'User Profile', icon: User, path: '/profile' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ name: 'Admin Portal', icon: ShieldCheck, path: '/admin' });
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 border-r border-slate-800 bg-dark-900/60 p-4 flex flex-col justify-between h-full backdrop-blur-md">
      <div className="flex flex-col space-y-6">
        {/* Brand/Logo */}
        <div className="flex items-center space-x-2 px-2 py-3">
          <div className="h-9 w-9 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-500/20">
            P
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
            PlacementPro <span className="text-xs text-indigo-400 font-semibold align-super ml-0.5">AI</span>
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-105 ${
                    isActive ? 'text-indigo-400' : 'text-slate-400'
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Actions / Footer */}
      <div className="border-t border-slate-800 pt-4 flex flex-col space-y-3">
        <div className="flex items-center space-x-3 px-2 py-1">
          <div className="h-8 w-8 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {user?.username?.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate leading-none">
              {user?.username}
            </p>
            <p className="text-[10px] text-slate-500 truncate leading-none mt-1">
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 transition-colors duration-150 hover:bg-red-500/10"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
