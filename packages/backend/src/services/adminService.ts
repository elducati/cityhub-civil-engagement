import { getDatabase } from '../config/database';
import { getCache, setCache } from './cacheService';
import { userRepository } from '../repositories/userRepository';
import { createError } from '../middleware/errorHandler';

export interface DashboardStats {
  totalUsers: number;
  totalProposals: number;
  totalVotes: number;
  engagementRate: number;
  proposalsByStatus: {
    OPEN: number;
    CLOSED: number;
    ARCHIVED: number;
  };
  usersByRole: {
    USER: number;
    MODERATOR: number;
    ADMIN: number;
  };
  thisMonthProposals: number;
  lastMonthProposals: number;
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    userId: string | null;
    createdAt: Date;
  }>;
}

export interface UserListItem {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  createdAt: Date;
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
  createdAt: Date;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const cached = await getCache<DashboardStats>('admin:dashboard');
  if (cached) return cached;

  const db = getDatabase();

  const [userCount, proposalCount, voteCount] = await Promise.all([
    db('users').count('id as total').first(),
    db('proposals').count('id as total').first(),
    db('votes').count('id as total').first(),
  ]);

  const totalUsers = parseInt(String(userCount?.total || 0), 10);
  const totalProposals = parseInt(String(proposalCount?.total || 0), 10);
  const totalVotes = parseInt(String(voteCount?.total || 0), 10);

  const statusCounts = await db('proposals')
    .select('status')
    .count('id as count')
    .groupBy('status');

  const proposalsByStatus = { OPEN: 0, CLOSED: 0, ARCHIVED: 0 };
  for (const row of statusCounts) {
    if (row.status in proposalsByStatus) {
      proposalsByStatus[row.status as keyof typeof proposalsByStatus] = parseInt(String(row.count), 10);
    }
  }

  const roleCounts = await db('users')
    .select('role')
    .count('id as count')
    .groupBy('role');

  const usersByRole = { USER: 0, MODERATOR: 0, ADMIN: 0 };
  for (const row of roleCounts) {
    if (row.role in usersByRole) {
      usersByRole[row.role as keyof typeof usersByRole] = parseInt(String(row.count), 10);
    }
  }

  const uniqueVoterResult = await db('votes').countDistinct('user_id as count').first();
  const uniqueVoterCount = parseInt(String(uniqueVoterResult?.count || 0), 10);
  const engagementRate = totalUsers > 0 ? uniqueVoterCount / totalUsers : 0;

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const [thisMonth, lastMonth] = await Promise.all([
    db('proposals').where('created_at', '>=', thisMonthStart).count('id as count').first().then(r => parseInt(String(r?.count || 0), 10)),
    db('proposals').where('created_at', '>=', lastMonthStart).where('created_at', '<', lastMonthEnd).count('id as count').first().then(r => parseInt(String(r?.count || 0), 10)),
  ]);

  const recentActivity = await db('audit_logs')
    .select('id', 'action', 'entity_type', 'user_id', 'created_at')
    .orderBy('created_at', 'desc')
    .limit(10);

  const result: DashboardStats = {
    totalUsers,
    totalProposals,
    totalVotes,
    engagementRate,
    proposalsByStatus,
    usersByRole,
    thisMonthProposals: thisMonth,
    lastMonthProposals: lastMonth,
    recentActivity: recentActivity.map(r => ({
      id: r.id,
      action: r.action,
      entityType: r.entity_type,
      userId: r.user_id,
      createdAt: r.created_at,
    })),
  };

  await setCache('admin:dashboard', result, 120);
  return result;
}

export async function getUsers(page: number = 1, limit: number = 20): Promise<{ data: UserListItem[]; total: number; totalPages: number }> {
  const db = getDatabase();
  const offset = (page - 1) * limit;

  const countResult = await db('users').count('id as total').first();
  const total = parseInt(String(countResult?.total || 0), 10);

  const users = await db('users')
    .select('id', 'email', 'name', 'role', 'created_at')
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset);

  const userIds = users.map(u => u.id);

  const proposalCounts = await db('proposals')
    .select('author_id')
    .count('id as count')
    .whereIn('author_id', userIds)
    .groupBy('author_id');

  const voteCounts = await db('votes')
    .select('user_id')
    .count('id as count')
    .whereIn('user_id', userIds)
    .groupBy('user_id');

  const proposalCountMap: Record<string, number> = {};
  for (const row of proposalCounts) {
    proposalCountMap[row.author_id] = parseInt(String(row.count), 10);
  }

  const voteCountMap: Record<string, number> = {};
  for (const row of voteCounts) {
    voteCountMap[row.user_id] = parseInt(String(row.count), 10);
  }

  const data: UserListItem[] = users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.created_at,
    proposalCount: proposalCountMap[u.id] || 0,
    voteCount: voteCountMap[u.id] || 0,
  }));

  return { data, total, totalPages: Math.ceil(total / limit) };
}

export async function updateUserRole(userId: string, newRole: 'USER' | 'MODERATOR' | 'ADMIN', actorRole: string): Promise<void> {
  if (actorRole !== 'ADMIN') {
    throw createError('Only administrators can change user roles', 403);
  }

  const user = await userRepository.findById(userId);
  if (!user) {
    throw createError('User not found', 404);
  }

  await db_update_user_role(userId, newRole);
}

async function db_update_user_role(userId: string, role: string): Promise<void> {
  const db = getDatabase();
  await db('users').where('id', userId).update({ role });
}

export async function getAuditLogs(
  page: number = 1,
  limit: number = 50
): Promise<{ data: AuditLogEntry[]; total: number; totalPages: number }> {
  const db = getDatabase();
  const offset = (page - 1) * limit;

  const countResult = await db('audit_logs').count('id as total').first();
  const total = parseInt(String(countResult?.total || 0), 10);

  const rows = await db('audit_logs')
    .select('*')
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset);

  const data: AuditLogEntry[] = rows.map(r => ({
    id: r.id,
    userId: r.user_id,
    action: r.action,
    entityType: r.entity_type,
    entityId: r.entity_id,
    metadata: r.metadata,
    createdAt: r.created_at,
  }));

  return { data, total, totalPages: Math.ceil(total / limit) };
}
