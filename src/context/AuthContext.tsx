'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  fetchUserRole: (userId: string) => Promise<string>;
  syncUserToDb: (userId: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient();

  const fetchUserRole = async (userId: string): Promise<string> => {
    try {
      const res = await fetch(`/api/user/role?id=${userId}`);
      if (res.ok) {
        const userRole = await res.json();
        setRole(userRole);
        return userRole;
      }
      return 'comun';
    } catch (err) {
      console.error('Error fetching user role:', err);
      return 'comun';
    }
  };

  const syncUserToDb = async (userId: string, name: string) => {
    try {
      await fetch(`/api/user/loginsignup?uuid=${userId}&name=${encodeURIComponent(name)}`);
    } catch (err) {
      console.error('Error syncing user to DB:', err);
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.display_name || session.user.email || 'Cliente';
          await syncUserToDb(session.user.id, fullName);
          await fetchUserRole(session.user.id);
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      if (session?.user) {
        setUser(session.user);
        const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.display_name || session.user.email || 'Cliente';
        await syncUserToDb(session.user.id, fullName);
        await fetchUserRole(session.user.id);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Error calling logout API:', err);
    }
    // Limpiamos el estado del cliente también
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, error, signOut, fetchUserRole, syncUserToDb }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
