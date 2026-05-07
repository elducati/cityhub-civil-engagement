import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../config/database';
import { config } from '../config';
import { createError } from '../middleware/errorHandler';
import { createAuditLog } from './auditService';
import type { AuthUser } from '../types/express.d';

const BCRYPT_ROUNDS = 12;

export interface RegisterInput {
  email: string;
  password: string;
  role?: 'USER' | 'MODERATOR' | 'ADMIN';
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function registerUser(input: RegisterInput): Promise<{
  id: string;
  email: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  token: string;
}> {
  const db = getDatabase();

  const existing = await db('users').where('email', input.email).first();
  if (existing) {
    throw createError('Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const [user] = await db('users')
    .insert({
      email: input.email,
      password_hash: passwordHash,
      role: input.role || 'USER',
    })
    .returning(['id', 'email', 'role']);

  const token = generateToken(user);

  await createAuditLog({
    userId: user.id,
    action: 'CREATE',
    entityType: 'user',
    entityId: user.id,
    metadata: { email: user.email, role: user.role },
  });

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    token,
  };
}

export async function loginUser(input: LoginInput): Promise<{
  id: string;
  email: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  token: string;
}> {
  const db = getDatabase();

  const user = await db('users').where('email', input.email).first();
  if (!user) {
    throw createError('Invalid credentials', 401);
  }

  const valid = await bcrypt.compare(input.password, user.password_hash);
  if (!valid) {
    throw createError('Invalid credentials', 401);
  }

  const token = generateToken(user);

  await createAuditLog({
    userId: user.id,
    action: 'LOGIN',
    entityType: 'user',
    entityId: user.id,
  });

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    token,
  };
}

export async function getUserById(userId: string): Promise<AuthUser | null> {
  const db = getDatabase();

  const user = await db('users').where('id', userId).select('id', 'email', 'role', 'created_at').first();
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

export async function validateToken(token: string): Promise<AuthUser | null> {
  try {
    const decoded = jwt.verify(token, config.AUTH_JWT_SECRET) as { id: string; email: string; role: string };
    return await getUserById(decoded.id);
  } catch {
    return null;
  }
}

function generateToken(user: { id: string; email: string; role: string }): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = { expiresIn: config.AUTH_JWT_EXPIRY };
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.AUTH_JWT_SECRET,
    options
  );
}
