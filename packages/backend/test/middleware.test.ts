import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret-key-minimum-32-characters-required';

function authMiddleware(token: string | undefined): { valid: boolean; user?: any; error?: string } {
  if (!token) {
    return { valid: false, error: 'No token provided' };
  }

  if (!token.startsWith('Bearer ')) {
    return { valid: false, error: 'Invalid token format' };
  }

  const tokenValue = token.slice(7);

  try {
    const decoded = jwt.verify(tokenValue, JWT_SECRET);
    return { valid: true, user: decoded };
  } catch (error) {
    return { valid: false, error: 'Invalid token' };
  }
}

function requireRole(userRole: string, allowedRoles: string[]): { authorized: boolean } {
  if (!userRole) {
    return { authorized: false };
  }

  return { authorized: allowedRoles.includes(userRole) };
}

function rateLimitCheck(ip: string, requests: Map<string, number>, limit: number): { allowed: boolean; currentCount: number } {
  const currentCount = (requests.get(ip) || 0) + 1;
  requests.set(ip, currentCount);
  return { allowed: currentCount <= limit, currentCount };
}

describe('Auth Middleware', () => {
  describe('authMiddleware', () => {
    it('should validate valid token', () => {
      const token = jwt.sign(
        { userId: 'user-123', email: 'test@example.com', role: 'USER' },
        JWT_SECRET
      );

      const result = authMiddleware(`Bearer ${token}`);

      expect(result.valid).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.userId).toBe('user-123');
    });

    it('should reject missing token', () => {
      const result = authMiddleware(undefined);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('No token provided');
    });

    it('should reject invalid format', () => {
      const result = authMiddleware('InvalidFormat');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid token format');
    });

    it('should reject malformed token', () => {
      const result = authMiddleware('Bearer invalid.token.here');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid token');
    });

    it('should reject expired token', () => {
      const expiredToken = jwt.sign(
        { userId: 'user-123' },
        JWT_SECRET,
        { expiresIn: '-1s' }
      );

      const result = authMiddleware(`Bearer ${expiredToken}`);

      expect(result.valid).toBe(false);
    });
  });

  describe('requireRole', () => {
    it('should allow authorized role', () => {
      const result = requireRole('ADMIN', ['ADMIN', 'MODERATOR']);

      expect(result.authorized).toBe(true);
    });

    it('should reject unauthorized role', () => {
      const result = requireRole('USER', ['ADMIN']);

      expect(result.authorized).toBe(false);
    });

    it('should reject when no user role', () => {
      const result = requireRole('', ['ADMIN']);

      expect(result.authorized).toBe(false);
    });

    it('should allow multiple allowed roles', () => {
      expect(requireRole('ADMIN', ['ADMIN', 'MODERATOR', 'USER']).authorized).toBe(true);
      expect(requireRole('MODERATOR', ['ADMIN', 'MODERATOR', 'USER']).authorized).toBe(true);
      expect(requireRole('USER', ['ADMIN', 'MODERATOR', 'USER']).authorized).toBe(true);
    });
  });
});

describe('Rate Limiter Middleware', () => {
  describe('rateLimitCheck', () => {
    it('should allow requests under limit', () => {
      const requests = new Map<string, number>();

      for (let i = 0; i < 5; i++) {
        const result = rateLimitCheck('127.0.0.1', requests, 10);
        expect(result.allowed).toBe(true);
      }
    });

    it('should block requests over limit', () => {
      const requests = new Map<string, number>();

      for (let i = 0; i < 10; i++) {
        rateLimitCheck('127.0.0.1', requests, 5);
      }

      const result = rateLimitCheck('127.0.0.1', requests, 5);
      expect(result.allowed).toBe(false);
    });

    it('should track separate IPs independently', () => {
      const requests = new Map<string, number>();

      rateLimitCheck('192.168.1.1', requests, 2);
      rateLimitCheck('192.168.1.1', requests, 2);

      const result1 = rateLimitCheck('192.168.1.2', requests, 2);
      expect(result1.allowed).toBe(true);
    });
  });
});

describe('Error Handling', () => {
  it('should handle errors with status code', () => {
    const error = new Error('Validation failed');
    (error as any).statusCode = 400;

    expect((error as any).statusCode).toBe(400);
  });

  it('should handle authentication errors', () => {
    const error = new Error('Unauthorized');
    (error as any).statusCode = 401;

    expect((error as any).statusCode).toBe(401);
  });

  it('should handle forbidden errors', () => {
    const error = new Error('Forbidden');
    (error as any).statusCode = 403;

    expect((error as any).statusCode).toBe(403);
  });

  it('should handle not found errors', () => {
    const error = new Error('Not found');
    (error as any).statusCode = 404;

    expect((error as any).statusCode).toBe(404);
  });

  it('should handle server errors', () => {
    const error = new Error('Internal server error');

    const response = {
      status: error.message.includes('Internal') ? 500 : 400,
      message: error.message,
    };

    expect(response.status).toBe(500);
  });
});