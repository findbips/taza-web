import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, service: 'taza', database: 'up' });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
