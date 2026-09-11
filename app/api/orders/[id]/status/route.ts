import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireRole, handleError } from '@/lib/auth';

const schema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireRole(req, Role.ADMIN);
    const { id } = await params;
    const d = schema.parse(await req.json());
    const order = await prisma.order.update({ where: { id }, data: { status: d.status } });
    return NextResponse.json({ order });
  } catch (e) {
    return handleError(e);
  }
}
