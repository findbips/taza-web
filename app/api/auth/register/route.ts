import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { signToken, cookieOptions, SESSION_COOKIE, handleError } from '@/lib/auth';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const d = schema.parse(await req.json());
    const exists = await prisma.user.findUnique({ where: { email: d.email.toLowerCase() } });
    if (exists) return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
    const u = await prisma.user.create({
      data: {
        name: d.name,
        email: d.email.toLowerCase(),
        passwordHash: await bcrypt.hash(d.password, 12),
        phone: d.phone,
      },
    });
    const res = NextResponse.json(
      { user: { id: u.id, name: u.name, email: u.email, role: u.role } },
      { status: 201 }
    );
    res.cookies.set(SESSION_COOKIE, signToken(u.id, u.role), cookieOptions);
    return res;
  } catch (e) {
    return handleError(e);
  }
}
