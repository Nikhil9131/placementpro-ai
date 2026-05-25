'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/register';
  const isAdminPage = pathname.startsWith('/admin');

  useEffect(() => {
    if (!isLoading) {
      if (!user && !isPublicPage) {
        router.push('/login');
      } else if (user && isPublicPage) {
        router.push('/dashboard');
      } else if (user && isAdminPage && user.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, isPublicPage, isAdminPage, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-dark-950 text-slate-200">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm font-medium tracking-wide text-indigo-400">Restoring session...</p>
        </div>
      </div>
    );
  }

  // Render pages directly if they are public page configurations
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Auth pages dashboard frame layout
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-dark-950 text-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
