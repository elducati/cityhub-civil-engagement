import { api } from './api';

export interface DashboardStats {
  totalUsers: number;
  totalProposals: number;
  totalVotes: number;
  engagementRate: number;
  proposalsByStatus: {
    OPEN: number;
    UNDER_REVIEW: number;
    FEASIBILITY: number;
    PLANNED: number;
    IMPLEMENTED: number;
    REJECTED: number;
  };
  usersByRole: {
    USER: number;
    MODERATOR: number;
    ADMIN: number;
  };
  thisMonthProposals: number;
  lastMonthProposals: number;
  totalBudgetEstimated: number;
  totalBudgetActual: number;
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    userId: string | null;
    createdAt: string;
  }>;
}

export interface UserListItem {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  createdAt: string;
  proposalCount: number;
  voteCount: number;
}

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  totalPages: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return api.get<DashboardStats>('/api/admin/dashboard');
}

export async function getUsers(page: number = 1, limit: number = 20): Promise<PaginatedResult<UserListItem>> {
  return api.get<PaginatedResult<UserListItem>>(`/api/admin/users?page=${page}&limit=${limit}`);
}

export async function updateUserRole(userId: string, role: 'USER' | 'MODERATOR' | 'ADMIN'): Promise<void> {
  return api.put(`/api/admin/users/${userId}/role`, { role });
}

export async function getAuditLogs(page: number = 1, limit: number = 50): Promise<PaginatedResult<AuditLogEntry>> {
  return api.get<PaginatedResult<AuditLogEntry>>(`/api/admin/audit-logs?page=${page}&limit=${limit}`);
}
