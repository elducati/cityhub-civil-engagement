import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../src/config';

const JWT_SECRET = 'test-secret-key-minimum-32-characters-required';
const JWT_EXPIRY = '1h';

function generateToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

function generateTokenWithJTI(user: { id: string; email: string; role: string }): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role, jti: Math.random().toString(36).substring(7) },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error: any) {
    throw new Error('Invalid token');
  }
}

describe('Security Utils', () => {
  describe('Password Hashing with bcrypt', () => {
    it('should hash password with bcrypt', async () => {
      const password = 'securePassword123';
      const hash = await bcrypt.hash(password, 12);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    it('should generate different hashes for same password (salt)', async () => {
      const password = 'samePassword';
      const hash1 = await bcrypt.hash(password, 12);
      const hash2 = await bcrypt.hash(password, 12);

      expect(hash1).not.toBe(hash2);
    });

    it('should validate correct password', async () => {
      const password = 'mySecurePassword';
      const hash = await bcrypt.hash(password, 12);

      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'mySecurePassword';
      const hash = await bcrypt.hash(password, 12);

      const isValid = await bcrypt.compare('wrongPassword', hash);
      expect(isValid).toBe(false);
    });

    it('should handle special characters', async () => {
      const password = 'P@$$w0rd!#$%^&*()';
      const hash = await bcrypt.hash(password, 12);
      const isValid = await bcrypt.compare(password, hash);

      expect(isValid).toBe(true);
    });

    it('should handle unicode characters', async () => {
      const password = 'пароль中文🔐';
      const hash = await bcrypt.hash(password, 12);
      const isValid = await bcrypt.compare(password, hash);

      expect(isValid).toBe(true);
    });

    it('should handle long passwords', async () => {
      const password = 'a'.repeat(1000);
      const hash = await bcrypt.hash(password, 12);
      const isValid = await bcrypt.compare(password, hash);

      expect(isValid).toBe(true);
    });
  });

  describe('JWT Token Security', () => {
    it('should generate valid JWT token', () => {
      const user = { id: 'user-123', email: 'test@example.com', role: 'USER' };
      const token = generateToken(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include user payload in token', () => {
      const user = { id: 'user-456', email: 'admin@example.com', role: 'ADMIN' };
      const token = generateToken(user);
      const decoded = jwt.decode(token) as any;

      expect(decoded.userId).toBe('user-456');
      expect(decoded.email).toBe('admin@example.com');
      expect(decoded.role).toBe('ADMIN');
    });

    it('should set expiration time', () => {
      const user = { id: 'user-789', email: 'test@example.com', role: 'USER' };
      const token = generateToken(user);
      const decoded = jwt.decode(token) as any;

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });

    it('should verify valid token', () => {
      const user = { id: 'user-123', email: 'test@example.com', role: 'USER' };
      const token = generateToken(user);

      const decoded = verifyToken(token);

      expect(decoded.userId).toBe('user-123');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('USER');
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid-token')).toThrow('Invalid token');
    });

    it('should throw error for malformed token', () => {
      expect(() => verifyToken('invalid.token.here')).toThrow();
    });

    it('should throw error for expired token', () => {
      const expiredToken = jwt.sign(
        { userId: 'user-123', email: 'test@example.com', role: 'USER' },
        JWT_SECRET,
        { expiresIn: '-1s' }
      );

      expect(() => verifyToken(expiredToken)).toThrow();
    });

    it('should throw error for token with wrong secret', () => {
      const user = { id: 'user-123', email: 'test@example.com', role: 'USER' };
      const token = jwt.sign(user, 'wrong-secret-key');

      expect(() => verifyToken(token)).toThrow();
    });

    it('should generate unique jti for each token', () => {
      const user = { id: 'user-123', email: 'test@example.com', role: 'USER' };
      const token1 = generateTokenWithJTI(user);
      const token2 = generateTokenWithJTI(user);

      const decoded1 = jwt.decode(token1) as any;
      const decoded2 = jwt.decode(token2) as any;

      expect(decoded1.jti).toBeDefined();
      expect(decoded2.jti).toBeDefined();
      expect(decoded1.jti).not.toBe(decoded2.jti);
    });
  });

  describe('Password Security Requirements', () => {
    it('should work with minimum password length', async () => {
      const password = '123456';
      const hash = await bcrypt.hash(password, 12);
      const isValid = await bcrypt.compare(password, hash);

      expect(isValid).toBe(true);
    });
  });
});
