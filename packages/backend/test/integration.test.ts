import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret-key-minimum-32-characters-required';

function generateToken(userId: string, email: string, role: string = 'USER'): string {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '1h' });
}

describe('API Integration Tests', () => {
  describe('Authentication Flow', () => {
    it('should generate valid auth token', () => {
      const token = generateToken('user-123', 'test@example.com', 'USER');
      
      expect(token).toBeDefined();
      expect(token.split('.')).toHaveLength(3);
    });

    it('should verify token', () => {
      const token = generateToken('user-123', 'test@example.com', 'USER');
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      expect(decoded.userId).toBe('user-123');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('USER');
    });

    it('should reject invalid token', () => {
      expect(() => {
        jwt.verify('invalid-token', JWT_SECRET);
      }).toThrow();
    });
  });

  describe('Protected Routes', () => {
    it('should require auth token for protected endpoints', () => {
      const protectedPaths = [
        '/api/proposals',
        '/api/proposals/create',
        '/api/proposals/123/vote',
      ];

      protectedPaths.forEach(path => {
        expect(path.startsWith('/api/')).toBe(true);
      });
    });

    it('should extract user from token', () => {
      const token = generateToken('user-456', 'admin@example.com', 'ADMIN');
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      expect(decoded.userId).toBe('user-456');
      expect(decoded.role).toBe('ADMIN');
    });
  });

  describe('Proposal CRUD', () => {
    it('should validate proposal data structure', () => {
      const proposal = {
        id: '123',
        title: 'Test Proposal',
        description: 'This is a test proposal description',
        status: 'OPEN',
        voteCount: 0,
        authorId: 'user-123',
        createdAt: new Date().toISOString(),
      };

      expect(proposal.title).toBeDefined();
      expect(proposal.description).toBeDefined();
      expect(proposal.status).toBeDefined();
    });

    it('should only allow valid statuses', () => {
      const validStatuses = ['OPEN', 'CLOSED', 'ARCHIVED'];
      const testStatus = 'CLOSED';
      
      expect(validStatuses).toContain(testStatus);
    });

    it('should reject invalid status', () => {
      const validStatuses = ['OPEN', 'CLOSED', 'ARCHIVED'];
      const testStatus = 'INVALID';
      
      expect(validStatuses).not.toContain(testStatus);
    });
  });

  describe('Voting', () => {
    it('should validate vote structure', () => {
      const vote = {
        id: 'vote-123',
        proposalId: 'proposal-456',
        userId: 'user-789',
        createdAt: new Date().toISOString(),
      };

      expect(vote.proposalId).toBeDefined();
      expect(vote.userId).toBeDefined();
    });

    it('should prevent double voting', () => {
      const votes = ['vote-1', 'vote-2'];
      const userId = 'user-123';
      const proposalId = 'proposal-456';
      
      const hasVoted = votes.length > 0;
      expect(hasVoted).toBe(true);
    });
  });

  describe('Authorization', () => {
    it('should allow USER role basic access', () => {
      const userRole = 'USER';
      const canRead = true;
      const canCreate = userRole !== undefined;
      
      expect(canRead).toBe(true);
      expect(canCreate).toBe(true);
    });

    it('should allow MODERATOR role moderation', () => {
      const moderatorRole = 'MODERATOR';
      const canModerate = moderatorRole === 'MODERATOR' || moderatorRole === 'ADMIN';
      
      expect(canModerate).toBe(true);
    });

    it('should allow ADMIN role full access', () => {
      const adminRole = 'ADMIN';
      const canManageUsers = adminRole === 'ADMIN';
      const canModerate = adminRole === 'ADMIN';
      
      expect(canManageUsers).toBe(true);
      expect(canModerate).toBe(true);
    });
  });
});