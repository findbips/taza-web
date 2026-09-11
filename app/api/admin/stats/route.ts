import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireRole, handleError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    requireRole(req, Role.ADMIN);
    const [products, orders, customers, subscribers, revenue] = await Promise.all([
      prisma.product.count({ where: { active: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.newsletterSubscriber.count(),
      prisma.order.aggregate({ where: { status: { not: 'CANCELLED' } }, _sum: { total: true } }),
    ]);
    return NextResponse.json({ products, orders, customers, subscribers, revenue: revenue._sum.total || 0 });
  } catch (e) {
    return handleError(e);
  }
}
