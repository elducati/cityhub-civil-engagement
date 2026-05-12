'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { login as loginApi, register as registerApi, logout as logoutApi, getCurrentUser } from '@/lib/auth';
import type { LoginCredentials, RegisterData, UserProfile } from '@/types/user';

interface UseAuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

let authGeneration = 0;
const generationListeners = new Set<() => void>();

function subscribeToGeneration(onChange: () => void): () => void {
  generationListeners.add(onChange);
  return () => generationListeners.delete(onChange);
}

function bumpGeneration(): void {
  authGeneration++;
  generationListeners.forEach(fn => fn());
}

function getGeneration(): number {
  return authGeneration;
}

const initialState: UseAuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

export function useAuth() {
  const [state, setState] = useState<UseAuthState>(initialState);

  const generation = useSyncExternalStore(subscribeToGeneration, getGeneration, getGeneration);

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
  }, [fetchUser, generation]);

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
      bumpGeneration();
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
      bumpGeneration();
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
      bumpGeneration();
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
