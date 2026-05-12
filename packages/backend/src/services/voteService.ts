import { getDatabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { createAuditLog } from './auditService';
import { checkUserVoted, setUserVoted, removeUserVote, incrementVoteBuffer, deleteCache } from './cacheService';
import { publishVoteMessage } from './queueService';
import { proposalRepository } from '../repositories/proposalRepository';

export async function castVote(proposalId: string, userId: string): Promise<{
  proposalId: string;
  voteCount: number;
  userVoted: boolean;
}> {
  const db = getDatabase();
  const proposal = await proposalRepository.findById(proposalId);

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

  if (typeof proposal.vote_count !== 'number') {
    (proposal as any).vote_count = 0;
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

  await proposalRepository.incrementVoteCount(proposalId);
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

  await deleteCache('proposals:trending:10');

  const updated = await proposalRepository.findById(proposalId);

  return {
    proposalId,
    voteCount: updated?.vote_count || 0,
    userVoted: true,
  };
}

export async function removeVote(proposalId: string, userId: string): Promise<{
  proposalId: string;
  voteCount: number;
  userVoted: boolean;
}> {
  const db = getDatabase();
  const proposal = await proposalRepository.findById(proposalId);

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
  await proposalRepository.decrementVoteCount(proposalId);
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

  await deleteCache('proposals:trending:10');

  const updated = await proposalRepository.findById(proposalId);

  return {
    proposalId,
    voteCount: Math.max(0, updated?.vote_count || 0),
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
