import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { signToken, cookieOptions, SESSION_COOKIE, handleError } from '@/lib/auth';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const d = schema.parse(await req.json());
    const u = await prisma.user.findUnique({ where: { email: d.email.toLowerCase() } });
    if (!u || !(await bcrypt.compare(d.password, u.passwordHash))) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }
    const res = NextResponse.json({ user: { id: u.id, name: u.name, email: u.email, role: u.role } });
    res.cookies.set(SESSION_COOKIE, signToken(u.id, u.role), cookieOptions);
    return res;
  } catch (e) {
    return handleError(e);
  }
}
