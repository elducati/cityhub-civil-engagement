import { getDatabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { createAuditLog } from './auditService';
import { getCache, setCache, deleteCache } from './cacheService';
import { emitProposalCreated, emitProposalUpdated, emitProposalDeleted, emitProposalStatusChanged } from './socketService';
import { proposalRepository } from '../repositories/proposalRepository';
import type { PaginationResult } from '../types/express.d';

export type ProposalStatus = 'OPEN' | 'UNDER_REVIEW' | 'FEASIBILITY' | 'PLANNED' | 'IMPLEMENTED' | 'REJECTED';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  authorId: string;
  status: ProposalStatus;
  voteCount: number;
  createdAt: Date;
  updatedAt?: Date;
  userVote?: boolean;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
  tags: string[];
  budgetEstimated: number | null;
  budgetActual: number | null;
  budgetCurrency: string;
}

export interface CreateProposalInput {
  title: string;
  description: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  tags?: string[];
}

export interface UpdateProposalInput {
  title?: string;
  description?: string;
  status?: ProposalStatus;
  tags?: string[];
  budgetEstimated?: number | null;
  budgetActual?: number | null;
  budgetCurrency?: string;
}

function mapRow(row: {
  id: string;
  title: string;
  description: string;
  author_id: string;
  status: ProposalStatus;
  vote_count: number;
  created_at: Date;
  updated_at: Date;
  user_vote?: boolean;
  category?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  tags?: string[] | null;
  budget_estimated?: number | null;
  budget_actual?: number | null;
  budget_currency?: string;
}): Proposal {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    authorId: row.author_id,
    status: row.status,
    voteCount: row.vote_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    userVote: row.user_vote,
    category: row.category || null,
    latitude: row.latitude || null,
    longitude: row.longitude || null,
    tags: row.tags || [],
    budgetEstimated: row.budget_estimated ?? null,
    budgetActual: row.budget_actual ?? null,
    budgetCurrency: row.budget_currency ?? 'USD',
  };
}

export async function getTrendingProposals(limit: number = 10): Promise<Proposal[]> {
  const cacheKey = `proposals:trending:${limit}`;
  const cached = await getCache<Proposal[]>(cacheKey);
  if (cached) return cached;

  const rows = await proposalRepository.findTrending(limit);
  const proposals = rows.map(r => mapRow({ ...r, user_vote: false }));
  await setCache(cacheKey, proposals, 120);
  return proposals;
}

export async function listProposals(
  params: {
    page?: number;
    limit?: number;
    status?: ProposalStatus;
    category?: string;
    tag?: string;
    sort?: 'createdAt' | 'voteCount';
    search?: string;
  },
  currentUserId?: string
): Promise<{ data: Proposal[]; pagination: PaginationResult }> {
  const sort = params.sort === 'voteCount' ? 'vote_count' : 'created_at';

  const result = await proposalRepository.findPaginated(
    { ...params, sort },
    currentUserId
  );

  return {
    data: result.data.map(r => mapRow(r)),
    pagination: result.pagination,
  };
}

export async function getProposalById(
  proposalId: string,
  currentUserId?: string
): Promise<Proposal & { author: { id: string; email: string }; userHasVoted: boolean }> {
  const row = await proposalRepository.findByIdWithAuthor(proposalId);

  if (!row) {
    throw createError('Proposal not found', 404);
  }

  let userHasVoted = false;
  if (currentUserId) {
    const db = getDatabase();
    const vote = await db('votes')
      .where('proposal_id', proposalId)
      .where('user_id', currentUserId)
      .first();
    userHasVoted = !!vote;
  }

  return {
    ...mapRow({ ...row, user_vote: false }),
    author: {
      id: row.author_id,
      email: row.author_email,
    },
    userHasVoted,
  };
}

export async function createProposal(
  input: CreateProposalInput,
  authorId: string
): Promise<Proposal> {
  const proposal = await proposalRepository.createProposal({
    title: input.title,
    description: input.description,
    author_id: authorId,
    category: input.category,
    latitude: input.latitude,
    longitude: input.longitude,
    tags: input.tags,
  });

  await createAuditLog({
    userId: authorId,
    action: 'CREATE',
    entityType: 'proposal',
    entityId: proposal.id,
    metadata: { title: proposal.title },
  });

  await deleteCache(`proposals:trending:10`);

  const mapped = mapRow({ ...proposal, user_vote: false });
  emitProposalCreated(mapped as unknown as Record<string, unknown>);
  return mapped;
}

export async function updateProposal(
  proposalId: string,
  input: UpdateProposalInput,
  userId: string,
  userRole: string
): Promise<Proposal> {
  const existing = await proposalRepository.findById(proposalId);
  if (!existing) {
    throw createError('Proposal not found', 404);
  }

  if (existing.author_id !== userId && userRole !== 'MODERATOR' && userRole !== 'ADMIN') {
    throw createError('Not authorized to update this proposal', 403);
  }

  const updateData: Record<string, unknown> = {};
  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.tags !== undefined) updateData.tags = input.tags;
  if (input.budgetEstimated !== undefined) updateData.budget_estimated = input.budgetEstimated;
  if (input.budgetActual !== undefined) updateData.budget_actual = input.budgetActual;
  if (input.budgetCurrency !== undefined) updateData.budget_currency = input.budgetCurrency;

  const proposal = await proposalRepository.update(proposalId, updateData);

  await createAuditLog({
    userId,
    action: 'UPDATE',
    entityType: 'proposal',
    entityId: proposalId,
    metadata: updateData,
  });

  await deleteCache(`proposals:trending:10`);

  const mapped = mapRow({ ...(proposal || existing), user_vote: false });
  if (input.status) {
    emitProposalStatusChanged(proposalId, input.status);
  }
  emitProposalUpdated(mapped as unknown as Record<string, unknown>);
  return mapped;
}

export async function deleteProposal(
  proposalId: string,
  userId: string,
  userRole: string
): Promise<void> {
  const existing = await proposalRepository.findById(proposalId);
  if (!existing) {
    throw createError('Proposal not found', 404);
  }

  if (existing.author_id !== userId && userRole !== 'MODERATOR' && userRole !== 'ADMIN') {
    throw createError('Not authorized to delete this proposal', 403);
  }

  await proposalRepository.delete(proposalId);

  await createAuditLog({
    userId,
    action: 'DELETE',
    entityType: 'proposal',
    entityId: proposalId,
    metadata: { title: existing.title },
  });

  await deleteCache(`proposals:trending:10`);

  emitProposalDeleted(proposalId);
}
