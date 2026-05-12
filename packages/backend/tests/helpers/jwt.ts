/**
 * JWT Test Helper
 * Generates signed JWTs for test purposes without requiring Keycloak.
 * NODE_ENV=test activates LocalJwtStrategy which validates against JWT_SECRET.
 */

import jwt from 'jsonwebtoken';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  keycloakId?: string;
}

interface GenerateOptions {
  expiresIn?: string;
  secret?: string;
}

const DEFAULT_SECRET = process.env.AUTH_JWT_SECRET || 'dev-secret-key-minimum-32-characters-required';
const DEFAULT_EXPIRY = '15m';

export function generateTestToken(
  user: { id: string; role: string; email: string; keycloakId?: string },
  options: GenerateOptions = {}
): string {
  const secret = options.secret || DEFAULT_SECRET;
  const expiresIn = options.expiresIn || DEFAULT_EXPIRY;

  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    ...(user.keycloakId && { keycloakId: user.keycloakId }),
  };

  return jwt.sign(payload, secret, { expiresIn });
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    if (!decoded?.exp) return true;
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}