import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as authService from '../src/services/authService';
import { config } from '../src/config';

jest.mock('../src/config/database', () => ({
  getDatabase: jest.fn(),
}));

jest.mock('../src/services/auditService', () => ({
  createAuditLog: jest.fn().mockResolvedValue(undefined),
}));

const { getDatabase } = require('../src/config/database');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(undefined),
        insert: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([
          { id: 'user-123', email: 'test@example.com', role: 'USER' },
        ]),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const result = await authService.registerUser({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.email).toBe('test@example.com');
      expect(result.token).toBeDefined();
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ id: 'existing-user' }),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      await expect(
        authService.registerUser({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Email already registered');
    });

    it('should hash password with bcrypt', async () => {
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(undefined),
        insert: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([
          { id: 'user-123', email: 'test@example.com', role: 'USER' },
        ]),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const bcryptHashSpy = jest.spyOn(bcrypt, 'hash');

      await authService.registerUser({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(bcryptHashSpy).toHaveBeenCalledWith('password123', 12);
    });
  });

  describe('loginUser', () => {
    it('should login user successfully with correct credentials', async () => {
      const passwordHash = await bcrypt.hash('password123', 12);
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({
          id: 'user-123',
          email: 'test@example.com',
          password_hash: passwordHash,
          role: 'USER',
        }),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const result = await authService.loginUser({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.email).toBe('test@example.com');
      expect(result.token).toBeDefined();
    });

    it('should throw error for invalid email', async () => {
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(undefined),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      await expect(
        authService.loginUser({
          email: 'wrong@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for invalid password', async () => {
      const passwordHash = await bcrypt.hash('correctpassword', 12);
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({
          id: 'user-123',
          email: 'test@example.com',
          password_hash: passwordHash,
          role: 'USER',
        }),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      await expect(
        authService.loginUser({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('validateToken', () => {
    it('should validate a valid token and return user', async () => {
      const token = jwt.sign(
        { id: 'user-123', email: 'test@example.com', role: 'USER' },
        config.AUTH_JWT_SECRET,
        { expiresIn: '1h' }
      );

      const mockDb = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({
          id: 'user-123',
          email: 'test@example.com',
          role: 'USER',
        }),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const result = await authService.validateToken(token);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('user-123');
    });

    it('should return null for invalid token', async () => {
      const result = await authService.validateToken('invalid-token');
      expect(result).toBeNull();
    });

    it('should return null for expired token', async () => {
      const token = jwt.sign(
        { id: 'user-123', email: 'test@example.com', role: 'USER' },
        config.AUTH_JWT_SECRET,
        { expiresIn: '-1s' }
      );

      const result = await authService.validateToken(token);
      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({
          id: 'user-123',
          email: 'test@example.com',
          role: 'USER',
          created_at: new Date(),
        }),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const result = await authService.getUserById('user-123');

      expect(result).not.toBeNull();
      expect(result?.email).toBe('test@example.com');
    });

    it('should return null when user not found', async () => {
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(undefined),
      };
      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const result = await authService.getUserById('non-existent');

      expect(result).toBeNull();
    });
  });
});