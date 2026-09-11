import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireRole, handleError } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const d = z
      .object({
        name: z.string().min(2),
        email: z.string().email(),
        phone: z.string().optional(),
        message: z.string().min(5),
      })
      .parse(await req.json());
    await prisma.contactMessage.create({ data: d });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}

export async function GET(req: NextRequest) {
  try {
    requireRole(req, Role.ADMIN);
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ messages });
  } catch (e) {
    return handleError(e);
  }
}
