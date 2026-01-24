'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'customer';
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signup = useCallback(
    async (email: string, password: string, name: string, role: string) => {
      try {
        setError(null);
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, role }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Signup failed');
        }

        const data = await response.json();
        setUser(data.user);
        router.push('/dashboard');
        return data.user;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Signup failed';
        setError(message);
        throw err;
      }
    },
    [router]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setError(null);
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Login failed');
        }

        const data = await response.json();
        setUser(data.user);
        router.push('/dashboard');
        return data.user;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        setError(message);
        throw err;
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      setError(null);
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Logout failed';
      setError(message);
    }
  }, [router]);

  return {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
