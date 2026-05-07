import { getDatabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { createAuditLog } from './auditService';
import { checkUserVoted, setUserVoted, removeUserVote, incrementVoteBuffer, deleteCachePattern } from './cacheService';
import { publishVoteMessage } from './queueService';

export async function castVote(proposalId: string, userId: string): Promise<{
  proposalId: string;
  voteCount: number;
  userVoted: boolean;
}> {
  const db = getDatabase();

  const proposal = await db('proposals').where('id', proposalId).first();
  if (!proposal) {
    throw createError('Proposal not found', 404);
  }

  if (proposal.status !== 'OPEN') {
    throw createError('Proposal is not open for voting', 400);
  }

  if (proposal.author_id === userId) {
    throw createError('Cannot vote on your own proposal', 400);
  }

  const cachedVote = await checkUserVoted(userId, proposalId);
  if (cachedVote) {
    throw createError('Already voted on this proposal', 409);
  }

  const existingVote = await db('votes')
    .where('proposal_id', proposalId)
    .where('user_id', userId)
    .first();

  if (existingVote) {
    throw createError('Already voted on this proposal', 409);
  }

  await db('votes').insert({
    proposal_id: proposalId,
    user_id: userId,
  });

  await db('proposals').where('id', proposalId).increment('vote_count', 1);

  await setUserVoted(userId, proposalId);
  await incrementVoteBuffer(proposalId);

  await publishVoteMessage({
    proposalId,
    userId,
    action: 'cast',
    timestamp: new Date().toISOString(),
  });

  await createAuditLog({
    userId,
    action: 'VOTE',
    entityType: 'proposal',
    entityId: proposalId,
  });

  await deleteCachePattern('proposals:*');

  const updatedProposal = await db('proposals').where('id', proposalId).first();

  return {
    proposalId,
    voteCount: updatedProposal?.vote_count || 0,
    userVoted: true,
  };
}

export async function removeVote(proposalId: string, userId: string): Promise<{
  proposalId: string;
  voteCount: number;
  userVoted: boolean;
}> {
  const db = getDatabase();

  const proposal = await db('proposals').where('id', proposalId).first();
  if (!proposal) {
    throw createError('Proposal not found', 404);
  }

  const vote = await db('votes')
    .where('proposal_id', proposalId)
    .where('user_id', userId)
    .first();

  if (!vote) {
    throw createError('Vote not found', 404);
  }

  await db('votes').where('id', vote.id).del();
  await db('proposals').where('id', proposalId).decrement('vote_count', 1);

  await removeUserVote(userId, proposalId);

  await publishVoteMessage({
    proposalId,
    userId,
    action: 'remove',
    timestamp: new Date().toISOString(),
  });

  await createAuditLog({
    userId,
    action: 'UNVOTE',
    entityType: 'proposal',
    entityId: proposalId,
  });

  await deleteCachePattern('proposals:*');

  const updatedProposal = await db('proposals').where('id', proposalId).first();

  return {
    proposalId,
    voteCount: Math.max(0, updatedProposal?.vote_count || 0),
    userVoted: false,
  };
}

export async function hasUserVoted(userId: string, proposalId: string): Promise<boolean> {
  const cachedVote = await checkUserVoted(userId, proposalId);
  if (cachedVote) return true;

  const db = getDatabase();
  const vote = await db('votes')
    .where('proposal_id', proposalId)
    .where('user_id', userId)
    .first();

  if (vote) {
    await setUserVoted(userId, proposalId);
    return true;
  }

  return false;
}