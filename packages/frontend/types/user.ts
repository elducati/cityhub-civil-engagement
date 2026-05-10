export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthUser extends User {
  token: string;
}

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}