import request from 'supertest';
import bcrypt from 'bcryptjs';

jest.mock('../src/config/database', () => ({
  getDatabase: jest.fn(),
  initDatabase: jest.fn(),
}));

jest.mock('../src/services/cacheService', () => ({
  getCache: jest.fn().mockResolvedValue(null),
  setCache: jest.fn().mockResolvedValue(undefined),
  deleteCachePattern: jest.fn().mockResolvedValue(undefined),
  checkUserVoted: jest.fn().mockResolvedValue(false),
  setUserVoted: jest.fn().mockResolvedValue(undefined),
  removeUserVote: jest.fn().mockResolvedValue(undefined),
  incrementVoteBuffer: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/services/queueService', () => ({
  connectToQueue: jest.fn().mockResolvedValue(undefined),
  publishVoteMessage: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/services/auditService', () => ({
  createAuditLog: jest.fn().mockResolvedValue(undefined),
}));

const { getDatabase } = require('../src/config/database');
const app = require('../src/index');

const mockUsers = new Map();
const mockProposals = new Map();
const mockVotes = new Map();
let proposalIdCounter = 1;
let voteIdCounter = 1;

function createMockDb() {
  return {
    where: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    first: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    del: jest.fn().mockResolvedValue(1),
    returning: jest.fn(),
    count: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockResolvedValue([]),
    join: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockResolvedValue([]),
    distinct: jest.fn().mockReturnThis(),
    increment: jest.fn().mockResolvedValue(1),
    decrement: jest.fn().mockResolvedValue(1),
    whereIn: jest.fn().mockReturnThis(),
  };
}

function setupMockHandlers(mockDb: ReturnType<typeof createMockDb>) {
  let currentUser: { id: string; email: string; password_hash: string; role: string } | null = null;

  mockDb.first.mockImplementation((table: string) => {
    if (table === 'users' || table === undefined) {
      return Promise.resolve(currentUser || null);
    }
    if (table === 'proposals') {
      const proposals = Array.from(mockProposals.values());
      return Promise.resolve(proposals[0] || null);
    }
    return Promise.resolve(null);
  });

  mockDb.insert.mockImplementation((data: unknown) => {
    if (data && typeof data === 'object' && 'email' in data) {
      const userId = `user-${Date.now()}`;
      const user = { id: userId, ...data as object };
      mockUsers.set(userId, user);
      return {
        returning: jest.fn().mockResolvedValue([user]),
      };
    }
    if (data && typeof data === 'object' && 'title' in data) {
      const proposalId = `proposal-${proposalIdCounter++}`;
      const proposal = {
        id: proposalId,
        ...data as object,
        vote_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockProposals.set(proposalId, proposal);
      return {
        returning: jest.fn().mockResolvedValue([proposal]),
      };
    }
    if (data && typeof data === 'object' && 'proposal_id' in data) {
      const voteId = `vote-${voteIdCounter++}`;
      const vote = { id: voteId, ...data as object };
      mockVotes.set(voteId, vote);
      return {
        returning: jest.fn().mockResolvedValue([vote]),
      };
    }
    return {
      returning: jest.fn().mockResolvedValue([data]),
    };
  });

  mockDb.select.mockImplementation(() => {
    return {
      ...mockDb,
      orderBy: mockDb.orderBy,
      limit: mockDb.limit,
      offset: mockDb.offset,
      where: mockDb.where,
      whereIn: mockDb.whereIn,
      join: mockDb.join,
      groupBy: mockDb.groupBy,
    };
  });

  mockDb.count.mockImplementation(() => ({
    ...mockDb,
    first: jest.fn().mockResolvedValue({ total: 0 }),
  }));

  return mockDb;
}

describe('API Integration Tests', () => {
  let mockDb: ReturnType<typeof createMockDb>;
  let authToken: string;
  let testUserId: string;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb = createMockDb();
    (getDatabase as jest.Mock).mockReturnValue(setupMockHandlers(mockDb));
    mockUsers.clear();
    mockProposals.clear();
    mockVotes.clear();
    proposalIdCounter = 1;
    voteIdCounter = 1;
  });

  describe('Health Check', () => {
    it('GET /api/health should return status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBeDefined();
    });
  });

  describe('Auth Endpoints', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user', async () => {
        mockDb.first.mockResolvedValueOnce(undefined);

        const response = await request(app)
          .post('/api/auth/register')
          .send({ email: 'test@example.com', password: 'password123' });

        expect(response.status).toBe(201);
        expect(response.body.token).toBeDefined();
        expect(response.body.email).toBe('test@example.com');
      });

      it('should reject duplicate email', async () => {
        mockDb.first.mockResolvedValueOnce({ id: 'existing-user', email: 'test@example.com' });

        const response = await request(app)
          .post('/api/auth/register')
          .send({ email: 'test@example.com', password: 'password123' });

        expect(response.status).toBe(409);
      });
    });

    describe('POST /api/auth/login', () => {
      it('should login with correct credentials', async () => {
        const passwordHash = await bcrypt.hash('password123', 12);
        mockDb.first.mockResolvedValueOnce({
          id: 'user-1',
          email: 'test@example.com',
          password_hash: passwordHash,
          role: 'USER',
        });

        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'password123' });

        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
      });

      it('should reject invalid credentials', async () => {
        mockDb.first.mockResolvedValueOnce({
          id: 'user-1',
          email: 'test@example.com',
          password_hash: await bcrypt.hash('correctpassword', 12),
          role: 'USER',
        });

        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'wrongpassword' });

        expect(response.status).toBe(401);
      });
    });

    describe('GET /api/auth/me', () => {
      it('should return current user with valid token', async () => {
        const passwordHash = await bcrypt.hash('password123', 12);
        mockDb.first.mockResolvedValueOnce({
          id: 'user-1',
          email: 'test@example.com',
          password_hash: passwordHash,
          role: 'USER',
        });

        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'password123' });

        const token = loginResponse.body.token;

        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.email).toBe('test@example.com');
      });

      it('should reject request without token', async () => {
        const response = await request(app).get('/api/auth/me');
        expect(response.status).toBe(401);
      });
    });
  });

  describe('Proposal Endpoints', () => {
    const createAuthToken = async () => {
      mockDb.first.mockResolvedValueOnce(undefined);
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({ email: 'user@example.com', password: 'password123' });
      return registerResponse.body.token;
    };

    describe('GET /api/proposals', () => {
      it('should return list of proposals', async () => {
        mockDb.first.mockResolvedValueOnce({ total: 0 });
        mockDb.offset.mockResolvedValueOnce([]);

        const response = await request(app).get('/api/proposals');

        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
        expect(response.body.pagination).toBeDefined();
      });

      it('should filter by status', async () => {
        mockDb.first.mockResolvedValueOnce({ total: 0 });
        mockDb.offset.mockResolvedValueOnce([]);

        const response = await request(app).get('/api/proposals?status=OPEN');

        expect(response.status).toBe(200);
      });
    });

    describe('POST /api/proposals', () => {
      it('should create proposal with auth', async () => {
        const token = await createAuthToken();

        const response = await request(app)
          .post('/api/proposals')
          .set('Authorization', `Bearer ${token}`)
          .send({ title: 'New Proposal', description: 'Description of the proposal' });

        expect(response.status).toBe(201);
        expect(response.body.title).toBe('New Proposal');
      });

      it('should reject proposal without auth', async () => {
        const response = await request(app)
          .post('/api/proposals')
          .send({ title: 'New Proposal', description: 'Description' });

        expect(response.status).toBe(401);
      });
    });

    describe('GET /api/proposals/:id', () => {
      it('should return single proposal', async () => {
        const proposal = {
          id: 'proposal-1',
          title: 'Test Proposal',
          description: 'Test Description',
          author_id: 'user-1',
          status: 'OPEN',
          vote_count: 0,
          created_at: new Date(),
          updated_at: new Date(),
          author_email: 'user@example.com',
        };
        mockProposals.set('proposal-1', proposal);
        mockDb.first.mockResolvedValueOnce(proposal);

        const response = await request(app).get('/api/proposals/proposal-1');

        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Test Proposal');
      });
    });

    describe('PUT /api/proposals/:id', () => {
      it('should update own proposal', async () => {
        const token = await createAuthToken();
        const proposal = {
          id: 'proposal-1',
          title: 'Old Title',
          description: 'Old Desc',
          author_id: 'user-1',
          status: 'OPEN',
          vote_count: 0,
        };
        mockProposals.set('proposal-1', proposal);
        mockDb.first
          .mockResolvedValueOnce(proposal)
          .mockResolvedValueOnce({ ...proposal, title: 'New Title' });

        const response = await request(app)
          .put('/api/proposals/proposal-1')
          .set('Authorization', `Bearer ${token}`)
          .send({ title: 'New Title' });

        expect(response.status).toBe(200);
      });
    });

    describe('DELETE /api/proposals/:id', () => {
      it('should delete own proposal', async () => {
        const token = await createAuthToken();
        const proposal = {
          id: 'proposal-1',
          author_id: 'user-1',
        };
        mockProposals.set('proposal-1', proposal);
        mockDb.first.mockResolvedValueOnce(proposal);

        const response = await request(app)
          .delete('/api/proposals/proposal-1')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(204);
      });
    });
  });

  describe('Voting Endpoints', () => {
    describe('POST /api/proposals/:id/vote', () => {
      it('should cast vote with auth', async () => {
        const token = await createAuthToken();
        const proposal = {
          id: 'proposal-1',
          author_id: 'author-1',
          status: 'OPEN',
          vote_count: 0,
        };
        mockProposals.set('proposal-1', proposal);
        mockDb.first
          .mockResolvedValueOnce(proposal)
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce({ ...proposal, vote_count: 1 });

        const response = await request(app)
          .post('/api/proposals/proposal-1/vote')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.userVoted).toBe(true);
      });

      it('should reject vote on own proposal', async () => {
        const token = await createAuthToken();
        const proposal = {
          id: 'proposal-1',
          author_id: 'user-1',
          status: 'OPEN',
        };
        mockProposals.set('proposal-1', proposal);
        mockDb.first.mockResolvedValueOnce(proposal);

        const response = await request(app)
          .post('/api/proposals/proposal-1/vote')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(400);
      });

      it('should reject vote without auth', async () => {
        const response = await request(app)
          .post('/api/proposals/proposal-1/vote');

        expect(response.status).toBe(401);
      });
    });

    describe('DELETE /api/proposals/:id/vote', () => {
      it('should remove vote with auth', async () => {
        const token = await createAuthToken();
        const proposal = {
          id: 'proposal-1',
          author_id: 'author-1',
          status: 'OPEN',
          vote_count: 1,
        };
        const vote = { id: 'vote-1', proposal_id: 'proposal-1', user_id: 'user-1' };
        mockProposals.set('proposal-1', proposal);
        mockVotes.set('vote-1', vote);
        mockDb.first
          .mockResolvedValueOnce(proposal)
          .mockResolvedValueOnce(vote)
          .mockResolvedValueOnce({ ...proposal, vote_count: 0 });

        const response = await request(app)
          .delete('/api/proposals/proposal-1/vote')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.userVoted).toBe(false);
      });
    });
  });

  describe('Analytics Endpoints', () => {
    describe('GET /api/analytics/proposals', () => {
      it('should return proposal analytics', async () => {
        mockDb.first
          .mockResolvedValueOnce({ total: 10 })
          .mockResolvedValueOnce({ count: 2 })
          .mockResolvedValueOnce({ count: 1 });
        mockDb.groupBy.mockResolvedValue([
          { status: 'OPEN', count: 5 },
          { status: 'CLOSED', count: 3 },
          { status: 'ARCHIVED', count: 2 },
        ]);

        const response = await request(app).get('/api/analytics/proposals');

        expect(response.status).toBe(200);
        expect(response.body.total).toBeDefined();
        expect(response.body.byStatus).toBeDefined();
      });
    });

    describe('GET /api/analytics/voting', () => {
      it('should return voting analytics', async () => {
        mockDb.first
          .mockResolvedValueOnce({ total: 100 })
          .mockResolvedValueOnce({ count: 50 })
          .mockResolvedValueOnce({ total: 200 });
        mockDb.limit.mockResolvedValue([]);

        const response = await request(app).get('/api/analytics/voting');

        expect(response.status).toBe(200);
        expect(response.body.totalVotes).toBeDefined();
        expect(response.body.uniqueVoters).toBeDefined();
      });
    });
  });
});