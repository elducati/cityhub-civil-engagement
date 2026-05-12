import { BaseRepository } from './baseRepository';
import type { PaginationResult } from '../types/express.d';

export type ProposalStatus = 'OPEN' | 'CLOSED' | 'ARCHIVED';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  author_id: string;
  status: ProposalStatus;
  vote_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProposalWithAuthor extends Proposal {
  author_email: string;
}

export interface CreateProposalInput {
  title: string;
  description: string;
  author_id: string;
  status?: ProposalStatus;
  vote_count?: number;
}

export interface UpdateProposalInput {
  title?: string;
  description?: string;
  status?: ProposalStatus;
}

export class ProposalRepository extends BaseRepository<Proposal> {
  constructor() {
    super('proposals');
  }

  async findTrending(limit: number = 10): Promise<Proposal[]> {
    return this.db(this.tableName)
      .select('id', 'title', 'description', 'author_id', 'status', 'vote_count', 'created_at', 'updated_at')
      .where('status', 'OPEN')
      .orderBy('vote_count', 'desc')
      .limit(limit) as Promise<Proposal[]>;
  }

  async findPaginated(
    params: {
      page?: number;
      limit?: number;
      status?: ProposalStatus;
      sort?: 'created_at' | 'vote_count';
      search?: string;
    },
    currentUserId?: string
  ): Promise<{ data: (Proposal & { userVote: boolean })[]; pagination: PaginationResult }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 10));
    const offset = (page - 1) * limit;
    const sortColumn = params.sort === 'vote_count' ? 'vote_count' : 'created_at';

    const baseQuery = this.db(this.tableName)
      .select(
        'p.id',
        'p.title',
        'p.description',
        'p.author_id',
        'p.status',
        'p.vote_count',
        'p.created_at',
        'p.updated_at'
      )
      .from(`${this.tableName} as p`);

    let countQuery = this.db(this.tableName).count('id as total');
    if (params.status) {
      countQuery = countQuery.where('status', params.status);
    }

    if (params.status) {
      baseQuery.where('p.status', params.status);
    }

    if (params.search) {
      const searchTerm = params.search;
      baseQuery.whereRaw(
        "to_tsvector('english', coalesce(p.title, '') || ' ' || coalesce(p.description, '')) @@ plainto_tsquery('english, ?)",
        [searchTerm]
      );
      countQuery = countQuery.whereRaw(
        "to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')) @@ plainto_tsquery('english', ?)",
        [searchTerm]
      );
    }

    const countResult = await countQuery.first();
    const total = parseInt(String(countResult?.total || 0), 10);

    let query = baseQuery
      .orderBy(`p.${sortColumn}`, 'desc')
      .limit(limit)
      .offset(offset);

    if (currentUserId) {
      const db = this.db;
      query = query
        .leftJoin('votes as v', function() {
          this.on('p.id', '=', 'v.proposal_id').andOn('v.user_id', '=', db.raw('?', [currentUserId]));
        })
        .select(
          'p.id',
          'p.title',
          'p.description',
          'p.author_id',
          'p.status',
          'p.vote_count',
          'p.created_at',
          'p.updated_at',
          this.db.raw('CASE WHEN v.id IS NOT NULL THEN true ELSE false END as user_vote')
        );
    }

    const rows = await query;

    const proposals = rows.map((row: { id: string; title: string; description: string; author_id: string; status: ProposalStatus; vote_count: number; created_at: Date; updated_at: Date; user_vote?: boolean }) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      author_id: row.author_id,
      status: row.status,
      vote_count: row.vote_count,
      created_at: row.created_at,
      updated_at: row.updated_at,
      userVote: currentUserId ? !!row.user_vote : false,
    }));

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

  async findByIdWithAuthor(proposalId: string): Promise<ProposalWithAuthor | null> {
    return this.db(this.tableName)
      .select(
        'p.id',
        'p.title',
        'p.description',
        'p.author_id',
        'p.status',
        'p.vote_count',
        'p.created_at',
        'p.updated_at',
        'u.email as author_email'
      )
      .from(`${this.tableName} as p`)
      .join('users as u', 'p.author_id', 'u.id')
      .where('p.id', proposalId)
      .first() as Promise<ProposalWithAuthor | null>;
  }

  async createProposal(input: CreateProposalInput): Promise<Proposal> {
    return this.create({
      title: input.title,
      description: input.description,
      author_id: input.author_id,
      status: input.status || 'OPEN',
      vote_count: input.vote_count || 0,
    });
  }

  async updateProposal(proposalId: string, input: UpdateProposalInput): Promise<Proposal | null> {
    const updateData: Record<string, unknown> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.status !== undefined) updateData.status = input.status;

    return this.update(proposalId, updateData);
  }

  async incrementVoteCount(proposalId: string): Promise<void> {
    await this.db(this.tableName).where('id', proposalId).increment('vote_count', 1);
  }

  async decrementVoteCount(proposalId: string): Promise<void> {
    await this.db(this.tableName).where('id', proposalId).decrement('vote_count', 1);
  }

  async countByStatus(): Promise<Record<ProposalStatus, number>> {
    const counts = await this.db(this.tableName)
      .select('status')
      .count('id as count')
      .groupBy('status');

    const result: Record<ProposalStatus, number> = {
      OPEN: 0,
      CLOSED: 0,
      ARCHIVED: 0,
    };

    for (const row of counts) {
      if (row.status in result) {
        result[row.status as ProposalStatus] = parseInt(String(row.count), 10);
      }
    }

    return result;
  }
}

export const proposalRepository = new ProposalRepository();