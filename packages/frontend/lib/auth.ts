import { api } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  const response = await api.post<AuthUser>('/api/auth/login', credentials);
  api.setAuthToken(response.token);
  return response;
}

export async function register(data: RegisterData): Promise<AuthUser> {
  const response = await api.post<AuthUser>('/api/auth/register', data);
  api.setAuthToken(response.token);
  return response;
}

export async function logout(): Promise<void> {
  api.setAuthToken(null);
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const response = await api.get<UserProfile>('/api/auth/me');
    return response;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!api.getAuthToken();
}