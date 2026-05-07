import type { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      query: {
        page?: string;
        limit?: string;
        status?: string;
        sort?: string;
      };
    }
  }
}

export interface UserPayload extends JwtPayload {
  id: string;
  email: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}