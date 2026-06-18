'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/AuthContext';

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading } = useAuth();

  const noSidebarRoutes = ['/login', '/signup', '/confirm'];
  const showSidebar = !noSidebarRoutes.includes(pathname);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d15] text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-ctp-mauve border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold tracking-wider animate-pulse text-ctp-mauve">Cargando Victorino's...</p>
        </div>
      </div>
    );
  }

  if (showSidebar) {
    return <Sidebar>{children}</Sidebar>;
  }

  return <>{children}</>;
}
