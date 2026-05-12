'use client';

import { useState, useEffect, useCallback } from 'react';
import { login as loginApi, register as registerApi, logout as logoutApi, getCurrentUser } from '@/lib/auth';
import type { LoginCredentials, RegisterData, UserProfile } from '@/types/user';

interface UseAuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<UseAuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  const fetchUser = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      setState({
        user,
        isLoading: false,
        isAuthenticated: !!user,
        error: null,
      });
    } catch {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await loginApi(credentials);
      const user = await getCurrentUser();
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
      return response;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await registerApi(data);
      const user = await getCurrentUser();
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
      return response;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await logoutApi();
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    } catch {
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    refreshUser: fetchUser,
  };
}
