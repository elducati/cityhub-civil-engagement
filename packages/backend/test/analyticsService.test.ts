import * as analyticsService from '../src/services/analyticsService';

jest.mock('../src/config/database', () => ({
  getDatabase: jest.fn(),
}));

jest.mock('../src/services/cacheService', () => ({
  getCache: jest.fn(),
  setCache: jest.fn(),
}));

const { getDatabase } = require('../src/config/database');
const { getCache, setCache } = require('../src/services/cacheService');

describe('analyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProposalAnalytics', () => {
    it('should return cached result if available', async () => {
      const cachedData = {
        total: 10,
        byStatus: { OPEN: 5, CLOSED: 3, ARCHIVED: 2 },
        thisMonth: 2,
        lastMonth: 1,
      };
      (getCache as jest.Mock).mockResolvedValue(cachedData);

      const result = await analyticsService.getProposalAnalytics();

      expect(result).toEqual(cachedData);
      expect(getDatabase).not.toHaveBeenCalled();
    });

    it('should calculate proposal statistics from database', async () => {
      (getCache as jest.Mock).mockResolvedValue(null);

      const mockDb = {
        count: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValueOnce({ total: 10 }),
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockResolvedValue([
          { status: 'OPEN', count: 5 },
          { status: 'CLOSED', count: 3 },
          { status: 'ARCHIVED', count: 2 },
        ]),
        where: jest.fn().mockReturnThis(),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const result = await analyticsService.getProposalAnalytics();

      expect(result.total).toBe(10);
      expect(result.byStatus.OPEN).toBe(5);
      expect(result.byStatus.CLOSED).toBe(3);
      expect(result.byStatus.ARCHIVED).toBe(2);
      expect(setCache).toHaveBeenCalled();
    });

    it('should calculate monthly proposal counts', async () => {
      (getCache as jest.Mock).mockResolvedValue(null);

      const mockDb = {
        count: jest.fn().mockReturnThis(),
        first: jest.fn()
          .mockResolvedValueOnce({ total: 10 })
          .mockResolvedValueOnce({ count: 2 })
          .mockResolvedValueOnce({ count: 1 }),
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockResolvedValue([]),
        where: jest.fn().mockReturnThis(),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const result = await analyticsService.getProposalAnalytics();

      expect(result.thisMonth).toBe(2);
      expect(result.lastMonth).toBe(1);
    });
  });

  describe('getVotingAnalytics', () => {
    it('should return cached result if available', async () => {
      const cachedData = {
        totalVotes: 100,
        uniqueVoters: 50,
        turnoutRate: 0.5,
        votesByProposal: [],
      };
      (getCache as jest.Mock).mockResolvedValue(cachedData);

      const result = await analyticsService.getVotingAnalytics();

      expect(result).toEqual(cachedData);
      expect(getDatabase).not.toHaveBeenCalled();
    });

    it('should calculate voting statistics from database', async () => {
      (getCache as jest.Mock).mockResolvedValue(null);

      const mockDb = {
        count: jest.fn().mockReturnThis(),
        first: jest.fn()
          .mockResolvedValueOnce({ total: 100 })
          .mockResolvedValueOnce({ count: 50 })
          .mockResolvedValueOnce({ total: 200 }),
        distinct: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([
          { proposal_id: 'prop-1', votes: 30 },
          { proposal_id: 'prop-2', votes: 20 },
        ]),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const result = await analyticsService.getVotingAnalytics();

      expect(result.totalVotes).toBe(100);
      expect(result.uniqueVoters).toBe(50);
      expect(result.turnoutRate).toBe(0.25);
      expect(result.votesByProposal).toHaveLength(2);
      expect(result.votesByProposal[0].votes).toBe(30);
    });

    it('should handle zero users for turnout calculation', async () => {
      (getCache as jest.Mock).mockResolvedValue(null);

      const mockDb = {
        count: jest.fn().mockReturnThis(),
        first: jest.fn()
          .mockResolvedValueOnce({ total: 0 })
          .mockResolvedValueOnce({ count: 0 })
          .mockResolvedValueOnce({ total: 0 }),
        distinct: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const result = await analyticsService.getVotingAnalytics();

      expect(result.turnoutRate).toBe(0);
    });

    it('should get top 20 proposals by votes', async () => {
      (getCache as jest.Mock).mockResolvedValue(null);

      const proposals = Array.from({ length: 25 }, (_, i) => ({
        proposal_id: `prop-${i}`,
        votes: 30 - i,
      }));

      const mockDb = {
        count: jest.fn().mockReturnThis(),
        first: jest.fn()
          .mockResolvedValueOnce({ total: 100 })
          .mockResolvedValueOnce({ count: 50 })
          .mockResolvedValueOnce({ total: 200 }),
        distinct: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(proposals),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const result = await analyticsService.getVotingAnalytics();

      expect(result.votesByProposal).toHaveLength(20);
    });
  });
});