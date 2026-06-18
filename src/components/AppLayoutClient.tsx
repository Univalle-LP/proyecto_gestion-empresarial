'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const noSidebarRoutes = ['/login', '/signup', '/confirm'];
  const showSidebar = !noSidebarRoutes.includes(pathname);

  if (showSidebar) {
    return <Sidebar>{children}</Sidebar>;
  }

  return <>{children}</>;
}
