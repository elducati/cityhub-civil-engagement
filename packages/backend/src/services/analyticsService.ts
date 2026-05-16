import { getDatabase } from '../config/database';
import { getCache, setCache } from './cacheService';

export interface ProposalAnalytics {
  total: number;
  byStatus: {
    OPEN: number;
    UNDER_REVIEW: number;
    FEASIBILITY: number;
    PLANNED: number;
    IMPLEMENTED: number;
    REJECTED: number;
  };
  thisMonth: number;
  lastMonth: number;
}

export interface VotingAnalytics {
  totalVotes: number;
  uniqueVoters: number;
  turnoutRate: number;
  votesByProposal: Array<{ proposalId: string; votes: number }>;
}

export async function getProposalAnalytics(): Promise<ProposalAnalytics> {
  const cacheKey = 'analytics:proposals';
  const cached = await getCache<ProposalAnalytics>(cacheKey);
  if (cached) return cached;

  const db = getDatabase();

  const totalResult = await db('proposals').count('id as total').first();
  const total = parseInt(String(totalResult?.total || 0), 10);

  const statusCounts = await db('proposals')
    .select('status')
    .count('id as count')
    .groupBy('status');

  const byStatus: ProposalAnalytics['byStatus'] = {
    OPEN: 0,
    UNDER_REVIEW: 0,
    FEASIBILITY: 0,
    PLANNED: 0,
    IMPLEMENTED: 0,
    REJECTED: 0,
  };

  for (const row of statusCounts) {
    if (row.status in byStatus) {
      byStatus[row.status as keyof typeof byStatus] = parseInt(String(row.count), 10);
    }
  }

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const thisMonthResult = await db('proposals')
    .where('created_at', '>=', thisMonthStart)
    .count('id as count')
    .first();
  const thisMonth = parseInt(String(thisMonthResult?.count || 0), 10);

  const lastMonthResult = await db('proposals')
    .where('created_at', '>=', lastMonthStart)
    .where('created_at', '<', lastMonthEnd)
    .count('id as count')
    .first();
  const lastMonth = parseInt(String(lastMonthResult?.count || 0), 10);

  const result: ProposalAnalytics = {
    total,
    byStatus,
    thisMonth,
    lastMonth,
  };

  await setCache(cacheKey, result, 300);
  return result;
}

export async function getVotingAnalytics(): Promise<VotingAnalytics> {
  const cacheKey = 'analytics:voting';
  const cached = await getCache<VotingAnalytics>(cacheKey);
  if (cached) return cached;

  const db = getDatabase();

  const totalVotesResult = await db('votes').count('id as total').first();
  const totalVotes = parseInt(String(totalVotesResult?.total || 0), 10);

  const uniqueVotersResult = await db('votes').distinct('user_id').count('user_id as count').first();
  const uniqueVoters = parseInt(String(uniqueVotersResult?.count || 0), 10);

  const usersCountResult = await db('users').count('id as total').first();
  const totalUsers = parseInt(String(usersCountResult?.total || 0), 10);
  const turnoutRate = totalUsers > 0 ? uniqueVoters / totalUsers : 0;

  const votesByProposalResult = await db('proposals')
    .select('id as proposal_id', 'vote_count as votes')
    .orderBy('vote_count', 'desc')
    .limit(20);

  const votesByProposal = votesByProposalResult.map((row: { proposal_id: string; votes: number }) => ({
    proposalId: row.proposal_id,
    votes: parseInt(String(row.votes), 10),
  }));

  const result: VotingAnalytics = {
    totalVotes,
    uniqueVoters,
    turnoutRate,
    votesByProposal,
  };

  await setCache(cacheKey, result, 300);
  return result;
}