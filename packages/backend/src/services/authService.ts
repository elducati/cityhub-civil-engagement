import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../config/database';
import { config } from '../config';
import { createError } from '../middleware/errorHandler';
import { createAuditLog } from './auditService';
import { logger } from './logger';
import type { AuthUser } from '../types/express.d';

const BCRYPT_ROUNDS = 12;
const BCRYPT_TIMEOUT_MS = 10000; // 10 second timeout for bcrypt
const MAX_AUDIT_LOG_RETRIES = 3;

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
  role?: 'USER' | 'MODERATOR' | 'ADMIN';
}

export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Validates database operation result and throws if invalid
 */
function validateInsertResult<T>(result: T[] | undefined, operation: string): T {
  if (!result || !Array.isArray(result) || result.length === 0) {
    logger.error(
      { result, operation },
      `Database operation failed: ${operation} returned no rows`
    );
    throw createError(
      'Database operation failed. Please try again later.',
      500
    );
  }
  return result[0];
}

/**
 * Handles database constraint errors with specific messages
 */
function handleDatabaseError(error: unknown, context: string): never {
  logger.error(
    { error: error.message, code: error.code, context },
    `Database error in ${context}`
  );

  // PostgreSQL unique constraint violation
  if ((error as any).code === '23505') {
    if (error.message.includes('email')) {
      throw createError('This email is already registered. Try logging in instead.', 409);
    }
    throw createError('This record already exists.', 409);
  }

  // Foreign key constraint
  if ((error as any).code === '23503') {
    throw createError('Invalid reference. Please check your input.', 400);
  }

  // Connection pool exhausted or timeout
  if ((error as any).message?.includes('timeout') || (error as any).message?.includes('pool')) {
    throw createError('Database is temporarily unavailable. Please try again.', 503);
  }

  // Generic database error
  throw createError('Database operation failed. Please try again later.', 500);
}

/**
 * Retries audit log creation with exponential backoff
 */
async function createAuditLogWithRetry(
  entry: Parameters<typeof createAuditLog>[0],
  attempt: number = 1
): Promise<void> {
  try {
    await createAuditLog(entry);
  } catch (error) {
    if (attempt < MAX_AUDIT_LOG_RETRIES) {
      const delay = Math.pow(2, attempt) * 100; // 200ms, 400ms, 800ms
      logger.warn(
        { attempt, nextRetryMs: delay, error: (error as Error).message },
        'Audit log creation failed, retrying...'
      );
      await new Promise(resolve => setTimeout(resolve, delay));
      return createAuditLogWithRetry(entry, attempt + 1);
    }
    // Log but don't throw - audit log is non-critical
    logger.error(
      { error: (error as Error).message, maxAttemptsReached: true },
      'Failed to create audit log after retries'
    );
  }
}

export async function registerUser(input: RegisterInput): Promise<{
  id: string;
  email: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  token: string;
}> {
  const db = getDatabase();

  try {
    // Check for existing user (with explicit error handling)
    let existing;
    try {
      existing = await db('users').where('email', input.email).first();
    } catch (error) {
      handleDatabaseError(error, 'existing user lookup');
    }

    if (existing) {
      throw createError(
        'This email is already registered. Try logging in instead.',
        409
      );
    }

    // Hash password with timeout
    let passwordHash: string;
    try {
      const hashPromise = bcrypt.hash(input.password, BCRYPT_ROUNDS);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Password hashing timeout')), BCRYPT_TIMEOUT_MS)
      );
      passwordHash = await Promise.race([hashPromise, timeoutPromise]);
    } catch (error) {
      logger.error(
        { error: (error as Error).message },
        'Password hashing failed'
      );
      throw createError(
        'Failed to process your password. Please try again.',
        500
      );
    }

    // Insert user with transaction-like behavior
    let user;
    try {
      const result = await db('users')
        .insert({
          email: input.email,
          name: input.name || null,
          password_hash: passwordHash,
          role: input.role || 'USER',
        })
        .returning(['id', 'email', 'role']);

      user = validateInsertResult(result, 'user insert');
    } catch (error: any) {
      // If it's a known API error, rethrow
      if (error.statusCode) throw error;
      // Otherwise handle as database error
      handleDatabaseError(error, 'user insert');
    }

    // Generate token
    let token: string;
    try {
      token = generateToken(user);
    } catch (error) {
      logger.error(
        { userId: user.id, error: (error as Error).message },
        'Token generation failed'
      );
      throw createError('Failed to generate session. Please try again.', 500);
    }

    // Create audit log asynchronously (non-blocking, with retries)
    createAuditLogWithRetry({
      userId: user.id,
      action: 'CREATE',
      entityType: 'user',
      entityId: user.id,
      metadata: { email: user.email, role: user.role },
    }).catch(err =>
      logger.error(
        { userId: user.id, error: err },
        'Audit log retry exhausted'
      )
    );

    logger.info(
      { userId: user.id, email: user.email },
      'User registered successfully'
    );

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      token,
    };
  } catch (error) {
    // If it's an API error, rethrow
    if ((error as any).statusCode) throw error;
    // Otherwise convert to generic error
    logger.error(
      { error: (error as Error).message, stack: (error as Error).stack },
      'Unexpected error in registerUser'
    );
    throw createError(
      'Registration failed. Please try again later.',
      500
    );
  }
}

export async function loginUser(input: LoginInput): Promise<{
  id: string;
  email: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  token: string;
}> {
  const db = getDatabase();

  try {
    let user;
    try {
      user = await db('users').where('email', input.email).first();
    } catch (error) {
      handleDatabaseError(error, 'user lookup for login');
    }

    if (!user) {
      throw createError('Invalid email or password', 401);
    }

    let passwordValid = false;
    try {
      passwordValid = await bcrypt.compare(input.password, user.password_hash);
    } catch (error) {
      logger.error(
        { userId: user.id, error: (error as Error).message },
        'Password comparison failed'
      );
      throw createError('Authentication failed. Please try again.', 500);
    }

    if (!passwordValid) {
      throw createError('Invalid email or password', 401);
    }

    let token: string;
    try {
      token = generateToken(user);
    } catch (error) {
      logger.error(
        { userId: user.id, error: (error as Error).message },
        'Token generation failed during login'
      );
      throw createError('Failed to generate session. Please try again.', 500);
    }

    // Create audit log asynchronously
    createAuditLogWithRetry({
      userId: user.id,
      action: 'LOGIN',
      entityType: 'user',
      entityId: user.id,
    }).catch(err =>
      logger.error({ userId: user.id, error: err }, 'Audit log creation failed')
    );

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      token,
    };
  } catch (error) {
    // If it's an API error, rethrow
    if ((error as any).statusCode) throw error;
    // Otherwise convert to generic error
    logger.error(
      { error: (error as Error).message },
      'Unexpected error in loginUser'
    );
    throw createError('Login failed. Please try again later.', 500);
  }
}

export async function getUserById(userId: string): Promise<AuthUser | null> {
  const db = getDatabase();

  try {
    const user = await db('users')
      .where('id', userId)
      .select('id', 'email', 'role', 'created_at')
      .first();

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    logger.error(
      { userId, error: (error as Error).message },
      'Error fetching user by ID'
    );
    return null;
  }
}

export async function validateToken(token: string): Promise<AuthUser | null> {
  try {
    const decoded = jwt.verify(token, config.AUTH_JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };
    return await getUserById(decoded.id);
  } catch (error) {
    logger.debug({ error: (error as Error).message }, 'Token validation failed');
    return null;
  }
}

function generateToken(user: { id: string; email: string; role: string }): string {
  try {
    const options: any = { expiresIn: config.AUTH_JWT_EXPIRY };
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.AUTH_JWT_SECRET,
      options
    );
    if (!token) {
      throw new Error('Token generation returned empty string');
    }
    return token;
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'JWT sign operation failed');
    throw error;
  }
}
