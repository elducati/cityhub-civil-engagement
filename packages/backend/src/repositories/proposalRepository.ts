import { BaseRepository } from './baseRepository';
import { Knex } from 'knex';
import type { PaginationResult } from '../types/express.d';

export type ProposalStatus = 'OPEN' | 'UNDER_REVIEW' | 'FEASIBILITY' | 'PLANNED' | 'IMPLEMENTED' | 'REJECTED';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  author_id: string;
  status: ProposalStatus;
  vote_count: number;
  created_at: Date;
  updated_at: Date;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
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
  category?: string;
  latitude?: number;
  longitude?: number;
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
      .select('id', 'title', 'description', 'author_id', 'status', 'vote_count', 'created_at', 'updated_at', 'category', 'latitude', 'longitude')
      .where('status', 'OPEN')
      .orderBy('vote_count', 'desc')
      .limit(limit) as Promise<Proposal[]>;
  }

  async findPaginated(
    params: {
      page?: number;
      limit?: number;
      status?: ProposalStatus;
      category?: string;
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
        'p.updated_at',
        'p.category',
        'p.latitude',
        'p.longitude'
      )
      .from(`${this.tableName} as p`);

    let countQuery = this.db(this.tableName).count('id as total');
    if (params.status) {
      countQuery = countQuery.where('status', params.status);
    }

    if (params.status) {
      baseQuery.where('p.status', params.status);
    }

    if (params.category) {
      baseQuery.where('p.category', params.category);
      countQuery = countQuery.where('category', params.category);
    }

    if (params.search) {
      const searchTerm = params.search;
      baseQuery.whereRaw(
        "to_tsvector('english', coalesce(p.title, '') || ' ' || coalesce(p.description, '')) @@ plainto_tsquery('english', ?)",
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
          'p.category',
          'p.latitude',
          'p.longitude',
          this.db.raw('CASE WHEN v.id IS NOT NULL THEN true ELSE false END as user_vote')
        );
    }

    const rows = await query;

    const proposals = rows.map((row: { id: string; title: string; description: string; author_id: string; status: ProposalStatus; vote_count: number; created_at: Date; updated_at: Date; user_vote?: boolean; category?: string | null; latitude?: number | null; longitude?: number | null }) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      author_id: row.author_id,
      status: row.status,
      vote_count: row.vote_count,
      created_at: row.created_at,
      updated_at: row.updated_at,
      userVote: currentUserId ? !!row.user_vote : false,
      category: row.category || null,
      latitude: row.latitude || null,
      longitude: row.longitude || null,
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
        'p.category',
        'p.latitude',
        'p.longitude',
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
      category: input.category || null,
      latitude: input.latitude || null,
      longitude: input.longitude || null,
    });
  }

  incrementVoteCount = async (proposalId: string, trx?: Knex.Transaction): Promise<void> => {
    const db = trx || this.db;
    await db(this.tableName).where('id', proposalId).increment('vote_count', 1);
  };

  decrementVoteCount = async (proposalId: string, trx?: Knex.Transaction): Promise<void> => {
    const db = trx || this.db;
    await db(this.tableName).where('id', proposalId).decrement('vote_count', 1);
  };
}

export const proposalRepository = new ProposalRepository();