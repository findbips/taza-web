import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';
import type { Role } from '@prisma/client';

const secret = process.env.JWT_SECRET || 'dev-secret-change-me';

export const SESSION_COOKIE = 'taza_session';

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60,
  path: '/',
};

export type AuthPayload = { userId: string; role: Role };

export function signToken(userId: string, role: Role) {
  return jwt.sign({ userId, role }, secret, { expiresIn: '7d' });
}

export function getAuth(req: NextRequest): AuthPayload | null {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, secret) as AuthPayload;
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function requireAuth(req: NextRequest): AuthPayload {
  const auth = getAuth(req);
  if (!auth) throw new ApiError(401, 'Authentication required');
  return auth;
}

export function requireRole(req: NextRequest, ...roles: Role[]): AuthPayload {
  const auth = requireAuth(req);
  if (!roles.includes(auth.role)) throw new ApiError(403, 'Forbidden');
  return auth;
}

export function handleError(e: unknown) {
  if (e instanceof ApiError) {
    return NextResponse.json({ message: e.message }, { status: e.status });
  }
  if (e instanceof ZodError) {
    return NextResponse.json({ message: e.issues[0]?.message || 'Invalid input' }, { status: 400 });
  }
  console.error(e);
  return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
}
