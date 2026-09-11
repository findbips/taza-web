import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireRole, handleError } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const d = z.object({ email: z.string().email(), source: z.string().optional() }).parse(await req.json());
    await prisma.newsletterSubscriber.upsert({
      where: { email: d.email.toLowerCase() },
      update: { source: d.source },
      create: { email: d.email.toLowerCase(), source: d.source || 'website' },
    });
    return NextResponse.json({ ok: true, message: 'You are on the list.' }, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}

export async function GET(req: NextRequest) {
  try {
    requireRole(req, Role.ADMIN);
    const subscribers = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ subscribers });
  } catch (e) {
    return handleError(e);
  }
}
