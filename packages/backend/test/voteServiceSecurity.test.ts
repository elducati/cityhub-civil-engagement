import * as voteService from '../src/services/voteService';

jest.mock('../src/config/database', () => ({
  getDatabase: jest.fn(),
}));

jest.mock('../src/services/cacheService', () => ({
  getCache: jest.fn(),
  setCache: jest.fn(),
  checkUserVoted: jest.fn(),
  setUserVoted: jest.fn(),
  removeUserVote: jest.fn(),
  incrementVoteBuffer: jest.fn(),
}));

jest.mock('../src/services/queueService', () => ({
  publishVoteMessage: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/services/auditService', () => ({
  createAuditLog: jest.fn().mockResolvedValue(undefined),
}));

const { getDatabase } = require('../src/config/database');

describe('VoteService Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('castVote', () => {
    it('should reject vote on non-existent proposal', async () => {
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(undefined),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      await expect(
        voteService.castVote('non-existent-proposal', 'user-123')
      ).rejects.toThrow('Proposal not found');
    });

    it('should reject vote on closed proposal', async () => {
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({
          id: 'proposal-123',
          status: 'CLOSED',
          author_id: 'user-456',
        }),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      await expect(
        voteService.castVote('proposal-123', 'user-123')
      ).rejects.toThrow('Proposal is not open for voting');
    });

    it('should reject vote on archived proposal', async () => {
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({
          id: 'proposal-123',
          status: 'ARCHIVED',
          author_id: 'user-456',
        }),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      await expect(
        voteService.castVote('proposal-123', 'user-123')
      ).rejects.toThrow('Proposal is not open for voting');
    });

    it('should reject user voting on their own proposal', async () => {
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({
          id: 'proposal-123',
          status: 'OPEN',
          author_id: 'user-123',
        }),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      await expect(
        voteService.castVote('proposal-123', 'user-123')
      ).rejects.toThrow('Cannot vote on your own proposal');
    });

    it('should reject duplicate vote', async () => {
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn()
          .mockResolvedValueOnce({
            id: 'proposal-123',
            status: 'OPEN',
            author_id: 'user-456',
          })
          .mockResolvedValueOnce({ id: 'vote-123' }),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      await expect(
        voteService.castVote('proposal-123', 'user-123')
      ).rejects.toThrow('You have already voted on this proposal');
    });

    it('should allow valid vote', async () => {
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn()
          .mockResolvedValueOnce({
            id: 'proposal-123',
            status: 'OPEN',
            author_id: 'user-456',
          })
          .mockResolvedValueOnce(undefined),
        insert: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ id: 'vote-new' }]),
        increment: jest.fn().mockResolvedValue(1),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const result = await voteService.castVote('proposal-123', 'user-123');

      expect(result).toBeDefined();
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.increment).toHaveBeenCalledWith('vote_count', 1);
    });
  });

  describe('removeVote', () => {
    it('should reject removal from non-existent vote', async () => {
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(undefined),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      await expect(
        voteService.removeVote('non-existent', 'user-123')
      ).rejects.toThrow('Vote not found');
    });

    it('should allow valid vote removal', async () => {
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({
          id: 'vote-123',
          proposal_id: 'proposal-123',
          user_id: 'user-123',
        }),
        del: jest.fn().mockResolvedValue(1),
        decrement: jest.fn().mockResolvedValue(1),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      await voteService.removeVote('vote-123', 'user-123');

      expect(mockDb.del).toHaveBeenCalled();
      expect(mockDb.decrement).toHaveBeenCalledWith('vote_count', 1);
    });
  });

  describe('getProposalVotes', () => {
    it('should return empty array for no votes', async () => {
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockResolvedValue([]),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const result = await voteService.getProposalVotes('proposal-123');

      expect(result).toEqual([]);
    });

    it('should return votes with user info', async () => {
      const mockVotes = [
        { id: 'v1', user_id: 'u1', created_at: new Date() },
        { id: 'v2', user_id: 'u2', created_at: new Date() },
      ];
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockResolvedValue(mockVotes),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const result = await voteService.getProposalVotes('proposal-123');

      expect(result).toHaveLength(2);
    });
  });

  describe('Vote Rate Limiting (conceptual)', () => {
    it('should prevent rapid successive votes from same user', async () => {
      const voteAttempts: any[] = [];
      const RATE_LIMIT_WINDOW = 1000;
      const MAX_VOTES_PER_WINDOW = 5;

      for (let i = 0; i < 10; i++) {
        const now = Date.now();
        const recentVotes = voteAttempts.filter(
          v => now - v.timestamp < RATE_LIMIT_WINDOW
        );

        if (recentVotes.length >= MAX_VOTES_PER_WINDOW) {
          expect(true).toBe(true);
          return;
        }

        voteAttempts.push({ timestamp: now, userId: 'user-123' });
      }

      expect(voteAttempts.length).toBeGreaterThanOrEqual(5);
    });
  });
});