'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  role: 'PLAYER' | 'ADMIN';
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  vipTier: string;
  avatar: string;
  gamesPlayed: number;
  gamesWon: number;
  totalWinnings: number;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  updateBalanceLocally: (newBalance: number) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Route protection
  useEffect(() => {
    if (loading) return;

    const isPublicPage = pathname === '/login' || pathname === '/register';

    if (!user && !isPublicPage) {
      router.push('/login');
    } else if (user && isPublicPage) {
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/lobby');
      }
    } else if (user && pathname.startsWith('/admin') && user.role !== 'ADMIN') {
      router.push('/lobby');
    }
  }, [user, loading, pathname, router]);

  const updateBalanceLocally = (newBalance: number) => {
    setUser((prev) => (prev ? { ...prev, balance: newBalance } : null));
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser,
        updateBalanceLocally,
        logout,
      }}
    >
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
