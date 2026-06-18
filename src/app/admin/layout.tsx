'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role !== 'admin') {
      router.replace('/');
    }
  }, [role, loading, router]);

  if (loading || role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-ctp-mauve border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
