export interface AuthUser {
  id: string;
  email: string;
  role: string;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}
