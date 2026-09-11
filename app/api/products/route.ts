import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireRole, handleError } from '@/lib/auth';

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  category: z.string().min(2),
  shortDescription: z.string().optional(),
  description: z.string().min(10),
  price: z.number().int().positive(),
  compareAtPrice: z.number().int().positive().optional(),
  stock: z.number().int().nonnegative(),
  sku: z.string().min(2),
  weightGrams: z.number().int().positive().optional(),
  ingredients: z.string().optional(),
  imageUrl: z.string().url().optional(),
  active: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const category = (searchParams.get('category') || '').trim();
    const products = await prisma.product.findMany({
      where: {
        active: true,
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ products });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    requireRole(req, Role.ADMIN);
    const d = productSchema.parse(await req.json());
    const p = await prisma.product.create({ data: d });
    return NextResponse.json({ product: p }, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
