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

// Public product lookup by slug — used by the storefront product page.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  try {
    const { idOrSlug } = await params;
    const p = await prisma.product.findUnique({ where: { slug: idOrSlug } });
    if (!p || !p.active) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    return NextResponse.json({ product: p });
  } catch (e) {
    return handleError(e);
  }
}

// Admin update by id.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  try {
    requireRole(req, Role.ADMIN);
    const { idOrSlug } = await params;
    const d = productSchema.partial().parse(await req.json());
    const p = await prisma.product.update({ where: { id: idOrSlug }, data: d });
    return NextResponse.json({ product: p });
  } catch (e) {
    return handleError(e);
  }
}

// Admin soft-delete (deactivate) by id.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  try {
    requireRole(req, Role.ADMIN);
    const { idOrSlug } = await params;
    await prisma.product.update({ where: { id: idOrSlug }, data: { active: false } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
