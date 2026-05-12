/**
 * Unit Tests - RolesGuard
 * Tests RBAC enforcement at guard level
 */

import { Request, Response, NextFunction } from 'express';
import { requireRole } from '../../../../src/middleware/auth';

describe('RolesGuard', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      user: undefined,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  const createMockUser = (role: string) => {
    (mockReq as any).user = { sub: 'usr-001', role, email: 'test@test.civic' };
  };

  describe('requireRole() middleware', () => {
    it('grants access when the user role matches the required role exactly', () => {
      createMockUser('USER');
      const middleware = requireRole('USER');
      
      middleware(mockReq as any, mockRes as any, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalledWith(403);
    });

    it('grants access when the user has a higher-privilege role than required (ADMIN passes MODERATOR gate)', () => {
      createMockUser('ADMIN');
      const middleware = requireRole('MODERATOR');
      
      middleware(mockReq as any, mockRes as any, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('grants ADMIN access to USER gate', () => {
      createMockUser('ADMIN');
      const middleware = requireRole('USER');
      
      middleware(mockReq as any, mockRes as any, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('denies access (403) when the user role is below the required threshold', () => {
      createMockUser('USER');
      const middleware = requireRole('MODERATOR');
      
      middleware(mockReq as any, mockRes as any, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Forbidden' })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('denies access (403) when no user is attached to the request context', () => {
      mockReq.user = undefined;
      const middleware = requireRole('USER');
      
      middleware(mockReq as any, mockRes as any, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Unauthorized' })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('allows access when no roles are specified', () => {
      createMockUser('USER');
      const middleware = requireRole();
      
      middleware(mockReq as any, mockRes as any, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('blocks MODERATOR from ADMIN gate', () => {
      createMockUser('MODERATOR');
      const middleware = requireRole('ADMIN');
      
      middleware(mockReq as any, mockRes as any, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('role hierarchy enforcement', () => {
    it('ADMIN can access all routes', () => {
      ['USER', 'MODERATOR', 'ADMIN'].forEach(requiredRole => {
        createMockUser('ADMIN');
        const middleware = requireRole(requiredRole as any);
        
        middleware(mockReq as any, mockRes as any, mockNext);
        
        expect(mockNext).toHaveBeenCalled();
        mockNext.mockClear();
      });
    });

    it('MODERATOR can access MODERATOR and USER routes but not ADMIN', () => {
      createMockUser('MODERATOR');
      
      let middleware = requireRole('MODERATOR');
      middleware(mockReq as any, mockRes as any, mockNext);
      expect(mockNext).toHaveBeenCalled();
      mockNext.mockClear();

      middleware = requireRole('USER');
      middleware(mockReq as any, mockRes as any, mockNext);
      expect(mockNext).toHaveBeenCalled();
      mockNext.mockClear();

      middleware = requireRole('ADMIN');
      middleware(mockReq as any, mockRes as any, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('USER can only access USER routes', () => {
      createMockUser('USER');
      
      let middleware = requireRole('USER');
      middleware(mockReq as any, mockRes as any, mockNext);
      expect(mockNext).toHaveBeenCalled();
      mockNext.mockClear();

      middleware = requireRole('MODERATOR');
      middleware(mockReq as any, mockRes as any, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      mockNext.mockClear();

      middleware = requireRole('ADMIN');
      middleware(mockReq as any, mockRes as any, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });
});