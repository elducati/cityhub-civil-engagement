import * as proposalService from '../src/services/proposalService';
import { createError } from '../src/middleware/errorHandler';

jest.mock('../src/config/database', () => ({
  getDatabase: jest.fn(),
}));

jest.mock('../src/services/auditService', () => ({
  createAuditLog: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/services/cacheService', () => ({
  getCache: jest.fn(),
  setCache: jest.fn(),
  deleteCachePattern: jest.fn().mockResolvedValue(undefined),
}));

const { getDatabase } = require('../src/config/database');
const { getCache, setCache } = require('../src/services/cacheService');

describe('proposalService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listProposals', () => {
    it('should return list of proposals with pagination', async () => {
      (getCache as jest.Mock).mockResolvedValue(null);

      const mockProposals = [
        { id: '1', title: 'Proposal 1', description: 'Desc 1', author_id: 'author-1', status: 'OPEN', vote_count: 5, created_at: new Date(), updated_at: new Date() },
        { id: '2', title: 'Proposal 2', description: 'Desc 2', author_id: 'author-2', status: 'CLOSED', vote_count: 10, created_at: new Date(), updated_at: new Date() },
      ];

      const mockDb = {
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockResolvedValue(mockProposals),
        where: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ total: 2 }),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const result = await proposalService.listProposals({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
    });

    it('should filter by status', async () => {
      (getCache as jest.Mock).mockResolvedValue(null);

      const mockDb = {
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockResolvedValue([]),
        where: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ total: 0 }),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      await proposalService.listProposals({ status: 'OPEN' });

      expect(mockDb.where).toHaveBeenCalledWith('status', 'OPEN');
    });

    it('should use cache when available', async () => {
      const cachedResult = { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
      (getCache as jest.Mock).mockResolvedValue(cachedResult);

      const result = await proposalService.listProposals({});

      expect(result).toEqual(cachedResult);
      expect(getDatabase).not.toHaveBeenCalled();
    });
  });

  describe('getProposalById', () => {
    it('should return proposal with author info', async () => {
      const mockDb = {
        select: jest.fn().mockReturnThis(),
        join: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({
          id: 'proposal-1',
          title: 'Test Proposal',
          description: 'Test Description',
          author_id: 'author-1',
          status: 'OPEN',
          vote_count: 5,
          created_at: new Date(),
          updated_at: new Date(),
          author_email: 'author@example.com',
        }),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const result = await proposalService.getProposalById('proposal-1');

      expect(result.id).toBe('proposal-1');
      expect(result.author.email).toBe('author@example.com');
    });

    it('should throw 404 if proposal not found', async () => {
      const mockDb = {
        select: jest.fn().mockReturnThis(),
        join: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(undefined),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      await expect(proposalService.getProposalById('non-existent')).rejects.toThrow('Proposal not found');
    });
  });

  describe('createProposal', () => {
    it('should create new proposal', async () => {
      const mockDb = {
        insert: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{
          id: 'proposal-1',
          title: 'New Proposal',
          description: 'Description',
          author_id: 'author-1',
          status: 'OPEN',
          vote_count: 0,
          created_at: new Date(),
          updated_at: new Date(),
        }]),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const result = await proposalService.createProposal(
        { title: 'New Proposal', description: 'Description' },
        'author-1'
      );

      expect(result.title).toBe('New Proposal');
      expect(result.voteCount).toBe(0);
    });
  });

  describe('updateProposal', () => {
    it('should update proposal title and description', async () => {
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({
          id: 'proposal-1',
          author_id: 'author-1',
          title: 'Old Title',
          description: 'Old Description',
          status: 'OPEN',
          vote_count: 0,
        }),
        update: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{
          id: 'proposal-1',
          title: 'New Title',
          description: 'New Description',
          author_id: 'author-1',
          status: 'OPEN',
          vote_count: 0,
          created_at: new Date(),
          updated_at: new Date(),
        }]),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const result = await proposalService.updateProposal(
        'proposal-1',
        { title: 'New Title', description: 'New Description' },
        'author-1',
        'USER'
      );

      expect(result.title).toBe('New Title');
    });

    it('should allow moderator to update any proposal', async () => {
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({
          id: 'proposal-1',
          author_id: 'other-author',
          title: 'Title',
          description: 'Desc',
          status: 'OPEN',
          vote_count: 0,
        }),
        update: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{
          id: 'proposal-1',
          title: 'Updated',
          description: 'Desc',
          author_id: 'other-author',
          status: 'OPEN',
          vote_count: 0,
          created_at: new Date(),
          updated_at: new Date(),
        }]),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const result = await proposalService.updateProposal(
        'proposal-1',
        { title: 'Updated' },
        'moderator-1',
        'MODERATOR'
      );

      expect(result.title).toBe('Updated');
    });

    it('should throw 403 if non-owner tries to update', async () => {
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({
          id: 'proposal-1',
          author_id: 'owner-1',
          title: 'Title',
          description: 'Desc',
          status: 'OPEN',
          vote_count: 0,
        }),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      await expect(
        proposalService.updateProposal('proposal-1', { title: 'New' }, 'other-user', 'USER')
      ).rejects.toThrow('Not authorized');
    });
  });

  describe('deleteProposal', () => {
    it('should delete proposal as owner', async () => {
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({
          id: 'proposal-1',
          author_id: 'author-1',
          title: 'To Delete',
        }),
        del: jest.fn().mockResolvedValue(1),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      await expect(proposalService.deleteProposal('proposal-1', 'author-1', 'USER')).resolves.toBeUndefined();
    });

    it('should throw 403 for non-owner', async () => {
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({
          id: 'proposal-1',
          author_id: 'owner-1',
        }),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      await expect(proposalService.deleteProposal('proposal-1', 'other-user', 'USER')).rejects.toThrow('Not authorized');
    });
  });
});