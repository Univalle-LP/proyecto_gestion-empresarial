'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createBrowserClient } from '@/lib/supabase';

export default function Confirm() {
  const router = useRouter();
  const { syncUserToDb, fetchUserRole } = useAuth();
  const supabase = createBrowserClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const fullName = session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || session.user.email || 'Cliente';
        await syncUserToDb(session.user.id, fullName);
        await fetchUserRole(session.user.id);
        router.replace('/');
      } else {
        router.replace('/login');
      }
    };
    checkUser();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d15] text-white">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-ctp-mauve border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-wider animate-pulse text-ctp-mauve">Confirmando sesión...</p>
      </div>
    </div>
  );
}
