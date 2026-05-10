import { getDatabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { createAuditLog } from './auditService';
import { getCache, setCache, deleteCachePattern } from './cacheService';
import type { PaginationResult } from '../types/express.d';

export type ProposalStatus = 'OPEN' | 'CLOSED' | 'ARCHIVED';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  authorId: string;
  status: ProposalStatus;
  voteCount: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateProposalInput {
  title: string;
  description: string;
}

export interface UpdateProposalInput {
  title?: string;
  description?: string;
  status?: ProposalStatus;
}

export async function getTrendingProposals(limit: number = 10): Promise<Proposal[]> {
  const cacheKey = `proposals:trending:${limit}`;
  const cached = await getCache<Proposal[]>(cacheKey);
  if (cached) return cached;

  const db = getDatabase();
  const rows = await db('proposals')
    .select('id', 'title', 'description', 'author_id', 'status', 'vote_count', 'created_at', 'updated_at')
    .where('status', 'OPEN')
    .orderBy('vote_count', 'desc')
    .limit(limit);

  const proposals = rows.map((row: ProposalRow) => mapRowToProposal(row as ProposalRow));
  await setCache(cacheKey, proposals, 120);
  return proposals;
}

interface ProposalRow {
  id: string;
  title: string;
  description: string;
  author_id: string;
  status: ProposalStatus;
  vote_count: number;
  created_at: Date;
  updated_at: Date;
  author_email?: string;
  user_vote?: boolean;
}

function mapRowToProposal(row: ProposalRow): Proposal {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    authorId: row.author_id,
    status: row.status,
    voteCount: row.vote_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listProposals(
  params: {
    page?: number;
    limit?: number;
    status?: ProposalStatus;
    sort?: 'createdAt' | 'voteCount';
    search?: string;
    userId?: string;
  },
  currentUserId?: string
): Promise<{ data: Proposal[]; pagination: PaginationResult }> {
  const db = getDatabase();
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 10));
  const offset = (page - 1) * limit;
  const isDescending = true;

  const cacheKey = `proposals:list:${page}:${limit}:${params.status || 'all'}:${params.sort || 'createdAt'}:${params.search || ''}`;
  const cached = await getCache<{ data: Proposal[]; pagination: PaginationResult }>(cacheKey);
  let proposals = cached ? [...cached.data] : [];
  let total = cached ? cached.pagination.total : 0;

  if (!cached) {
    let query = db('proposals')
      .select(
        'proposals.id',
        'proposals.title',
        'proposals.description',
        'proposals.author_id',
        'proposals.status',
        'proposals.vote_count',
        'proposals.created_at',
        'proposals.updated_at'
      )
      .orderBy(params.sort === 'voteCount' ? 'vote_count' : 'created_at', isDescending ? 'desc' : 'asc')
      .limit(limit)
      .offset(offset);

    if (params.status) {
      query = query.where('status', params.status);
    }

    if (params.search) {
      query = query.whereRaw(
        "to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')) @@ plainto_tsquery('english', ?)",
        [params.search]
      );
    }

    let countQuery = db('proposals').count('id as total');
    if (params.status) {
      countQuery = countQuery.where('status', params.status);
    }
    const countResult = await countQuery.first();
    total = parseInt(String(countResult?.total || 0), 10);

    const rows = await query;

    proposals = rows.map((row: ProposalRow) => mapRowToProposal(row as ProposalRow));

    const result = {
      data: proposals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    await setCache(cacheKey, result, 60);
  }

  if (currentUserId && proposals.length > 0) {
    const proposalIds = proposals.map((p) => p.id);
    const votes = await db('votes')
      .select('proposal_id')
      .whereIn('proposal_id', proposalIds)
      .where('user_id', currentUserId);

    const votedIds = new Set(votes.map((v) => v.proposal_id));
    proposals = proposals.map((p) => ({
      ...p,
      userVote: votedIds.has(p.id),
    }));
  } else {
    proposals = proposals.map((p) => ({ ...p, userVote: false }));
  }

  return {
    data: proposals,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getProposalById(
  proposalId: string,
  currentUserId?: string
): Promise<Proposal & { author: { id: string; email: string }; userHasVoted: boolean }> {
  const db = getDatabase();

  const row = await db('proposals')
    .select(
      'proposals.*',
      'users.email as author_email'
    )
    .join('users', 'proposals.author_id', 'users.id')
    .where('proposals.id', proposalId)
    .first();

  if (!row) {
    throw createError('Proposal not found', 404);
  }

  let userHasVoted = false;
  if (currentUserId) {
    const vote = await db('votes')
      .where('proposal_id', proposalId)
      .where('user_id', currentUserId)
      .first();
    userHasVoted = !!vote;
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    authorId: row.author_id,
    status: row.status,
    voteCount: row.vote_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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
  const db = getDatabase();

  const [proposal] = await db('proposals')
    .insert({
      title: input.title,
      description: input.description,
      author_id: authorId,
      status: 'OPEN',
      vote_count: 0,
    })
    .returning(['id', 'title', 'description', 'author_id', 'status', 'vote_count', 'created_at', 'updated_at']);

  await createAuditLog({
    userId: authorId,
    action: 'CREATE',
    entityType: 'proposal',
    entityId: proposal.id,
    metadata: { title: proposal.title },
  });

  await deleteCachePattern('proposals:*');

  return mapRowToProposal(proposal as ProposalRow);
}

export async function updateProposal(
  proposalId: string,
  input: UpdateProposalInput,
  userId: string,
  userRole: string
): Promise<Proposal> {
  const db = getDatabase();

  const existing = await db('proposals').where('id', proposalId).first();
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

  const [proposal] = await db('proposals')
    .where('id', proposalId)
    .update(updateData)
    .returning(['id', 'title', 'description', 'author_id', 'status', 'vote_count', 'created_at', 'updated_at']);

  await createAuditLog({
    userId,
    action: 'UPDATE',
    entityType: 'proposal',
    entityId: proposalId,
    metadata: updateData,
  });

  await deleteCachePattern('proposals:*');

  return mapRowToProposal(proposal as ProposalRow);
}

export async function deleteProposal(
  proposalId: string,
  userId: string,
  userRole: string
): Promise<void> {
  const db = getDatabase();

  const existing = await db('proposals').where('id', proposalId).first();
  if (!existing) {
    throw createError('Proposal not found', 404);
  }

  if (existing.author_id !== userId && userRole !== 'MODERATOR' && userRole !== 'ADMIN') {
    throw createError('Not authorized to delete this proposal', 403);
  }

  await db('proposals').where('id', proposalId).del();

  await createAuditLog({
    userId,
    action: 'DELETE',
    entityType: 'proposal',
    entityId: proposalId,
    metadata: { title: existing.title },
  });

  await deleteCachePattern('proposals:*');
}
