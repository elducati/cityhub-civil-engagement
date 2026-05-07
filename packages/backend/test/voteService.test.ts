import * as voteService from '../src/services/voteService';

jest.mock('../src/config/database', () => ({
  getDatabase: jest.fn(),
}));

jest.mock('../src/services/auditService', () => ({
  createAuditLog: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/services/cacheService', () => ({
  checkUserVoted: jest.fn(),
  setUserVoted: jest.fn(),
  removeUserVote: jest.fn(),
  incrementVoteBuffer: jest.fn(),
  deleteCachePattern: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/services/queueService', () => ({
  publishVoteMessage: jest.fn().mockResolvedValue(undefined),
}));

const { getDatabase } = require('../src/config/database');
const { checkUserVoted, setUserVoted, removeUserVote, incrementVoteBuffer } = require('../src/services/cacheService');
const { publishVoteMessage } = require('../src/services/queueService');

describe('voteService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('castVote', () => {
    it('should cast a vote successfully', async () => {
      (checkUserVoted as jest.Mock).mockResolvedValue(false);

      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn()
          .mockResolvedValueOnce({
            id: 'proposal-1',
            author_id: 'author-1',
            status: 'OPEN',
            vote_count: 5,
          })
          .mockResolvedValueOnce({ vote_count: 6 }),
        insert: jest.fn().mockResolvedValue([1]),
        increment: jest.fn().mockResolvedValue(1),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const result = await voteService.castVote('proposal-1', 'voter-1');

      expect(result.proposalId).toBe('proposal-1');
      expect(result.userVoted).toBe(true);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.increment).toHaveBeenCalledWith('vote_count', 1);
      expect(setUserVoted).toHaveBeenCalledWith('voter-1', 'proposal-1');
    });

    it('should throw error if proposal not found', async () => {
      (checkUserVoted as jest.Mock).mockResolvedValue(false);

      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(undefined),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      await expect(voteService.castVote('non-existent', 'voter-1')).rejects.toThrow('Proposal not found');
    });

    it('should throw error if proposal is not open', async () => {
      (checkUserVoted as jest.Mock).mockResolvedValue(false);

      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({
          id: 'proposal-1',
          author_id: 'author-1',
          status: 'CLOSED',
        }),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      await expect(voteService.castVote('proposal-1', 'voter-1')).rejects.toThrow('Proposal is not open for voting');
    });

    it('should throw error if user is the author', async () => {
      (checkUserVoted as jest.Mock).mockResolvedValue(false);

      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({
          id: 'proposal-1',
          author_id: 'author-1',
          status: 'OPEN',
        }),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      await expect(voteService.castVote('proposal-1', 'author-1')).rejects.toThrow('Cannot vote on your own proposal');
    });

    it('should throw error if already voted (cached)', async () => {
      (checkUserVoted as jest.Mock).mockResolvedValue(true);

      await expect(voteService.castVote('proposal-1', 'voter-1')).rejects.toThrow('Already voted on this proposal');
    });

    it('should throw error if already voted (database)', async () => {
      (checkUserVoted as jest.Mock).mockResolvedValue(false);

      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn()
          .mockResolvedValueOnce({
            id: 'proposal-1',
            author_id: 'author-1',
            status: 'OPEN',
          })
          .mockResolvedValueOnce({ id: 'existing-vote' }),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      await expect(voteService.castVote('proposal-1', 'voter-1')).rejects.toThrow('Already voted on this proposal');
    });
  });

  describe('removeVote', () => {
    it('should remove vote successfully', async () => {
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn()
          .mockResolvedValueOnce({
            id: 'proposal-1',
            vote_count: 5,
          })
          .mockResolvedValueOnce({
            id: 'vote-1',
            proposal_id: 'proposal-1',
            user_id: 'voter-1',
          })
          .mockResolvedValueOnce({ vote_count: 4 }),
        del: jest.fn().mockResolvedValue(1),
        decrement: jest.fn().mockResolvedValue(1),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const result = await voteService.removeVote('proposal-1', 'voter-1');

      expect(result.proposalId).toBe('proposal-1');
      expect(result.userVoted).toBe(false);
      expect(result.voteCount).toBe(4);
      expect(removeUserVote).toHaveBeenCalledWith('voter-1', 'proposal-1');
    });

    it('should throw error if proposal not found', async () => {
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(undefined),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      await expect(voteService.removeVote('non-existent', 'voter-1')).rejects.toThrow('Proposal not found');
    });

    it('should throw error if vote not found', async () => {
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn()
          .mockResolvedValueOnce({
            id: 'proposal-1',
            vote_count: 5,
          })
          .mockResolvedValueOnce(undefined),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      await expect(voteService.removeVote('proposal-1', 'voter-1')).rejects.toThrow('Vote not found');
    });
  });

  describe('hasUserVoted', () => {
    it('should return true if user has voted (cached)', async () => {
      (checkUserVoted as jest.Mock).mockResolvedValue(true);

      const result = await voteService.hasUserVoted('voter-1', 'proposal-1');
      expect(result).toBe(true);
    });

    it('should return true if user has voted (database)', async () => {
      (checkUserVoted as jest.Mock).mockResolvedValue(false);

      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ id: 'vote-1' }),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const result = await voteService.hasUserVoted('voter-1', 'proposal-1');

      expect(result).toBe(true);
      expect(setUserVoted).toHaveBeenCalledWith('voter-1', 'proposal-1');
    });

    it('should return false if user has not voted', async () => {
      (checkUserVoted as jest.Mock).mockResolvedValue(false);

      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(undefined),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const result = await voteService.hasUserVoted('voter-1', 'proposal-1');
      expect(result).toBe(false);
    });
  });
});