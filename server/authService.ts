import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthUser } from '../shared/types.ts';

export interface StoredUser extends AuthUser {
  passwordHash: string;
  updatedAt: string;
}

export interface JwtPayloadData {
  sub: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  authUser?: JwtPayloadData;
}

let cachedDevSecret: string | null = null;

function getJwtSecret(): string {
  const configured = process.env.JWT_SECRET?.trim();
  if (
    configured &&
    configured !== 'replace_with_a_long_random_secret' &&
    configured !== 'replace_with_a_long_random_secret_at_least_32_chars' &&
    configured.length >= 16
  ) {
    return configured;
  }
  if (!cachedDevSecret) {
    cachedDevSecret = crypto.randomBytes(32).toString('hex');
    console.warn(
      'JWT_SECRET is not configured in environment; using ephemeral runtime secret (sessions reset on server restart).'
    );
  }
  return cachedDevSecret;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, expectedHex] = parts;
  if (!salt || !expectedHex) return false;
  const actualBuf = crypto.scryptSync(password, salt, 64);
  const expectedBuf = Buffer.from(expectedHex, 'hex');
  if (actualBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(actualBuf, expectedBuf);
}

export function signAuthToken(user: AuthUser): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
}

export function verifyAuthToken(token: string): JwtPayloadData {
  const decoded = jwt.verify(token, getJwtSecret());
  if (
    typeof decoded !== 'object' ||
    decoded === null ||
    typeof decoded.sub !== 'string' ||
    typeof (decoded as Record<string, unknown>).email !== 'string' ||
    typeof (decoded as Record<string, unknown>).name !== 'string'
  ) {
    throw new Error('Invalid token payload');
  }
  return {
    sub: decoded.sub,
    email: (decoded as Record<string, unknown>).email as string,
    name: (decoded as Record<string, unknown>).name as string,
  };
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in to continue.',
      error: { code: 'UNAUTHORIZED' },
    });
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Authentication token missing.',
      error: { code: 'UNAUTHORIZED' },
    });
    return;
  }

  try {
    req.authUser = verifyAuthToken(token);
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Your session has expired or is invalid. Please sign in again.',
      error: { code: 'INVALID_TOKEN' },
    });
  }
}
