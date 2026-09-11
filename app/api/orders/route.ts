import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Role, type OrderStatus } from '@prisma/client';
import { prisma } from '@/lib/db';
import { getAuth, requireRole, handleError } from '@/lib/auth';

const orderSchema = z.object({
  customerName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  address: z.string().min(5),
  city: z.string().default('Dhaka'),
  paymentMethod: z.enum(['COD', 'BKASH', 'NAGAD', 'CARD']).default('COD'),
  partnerCode: z.string().optional(),
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })).min(1),
});

function orderNo() {
  return `TAZA-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
}

// Place an order. Works for guests and logged-in customers alike.
export async function POST(req: NextRequest) {
  try {
    const d = orderSchema.parse(await req.json());
    const ids = [...new Set(d.items.map((i) => i.productId))];
    const products = await prisma.product.findMany({ where: { id: { in: ids }, active: true } });
    if (products.length !== ids.length) {
      return NextResponse.json({ message: 'One or more products are unavailable' }, { status: 400 });
    }
    const map = new Map(products.map((p) => [p.id, p]));
    let subtotal = 0;
    for (const i of d.items) {
      const p = map.get(i.productId)!;
      if (p.stock < i.quantity) {
        return NextResponse.json({ message: `Insufficient stock for ${p.name}` }, { status: 400 });
      }
      subtotal += p.price * i.quantity;
    }
    const deliveryFee = subtotal >= 3000 ? 0 : 80;

    let partnerId: string | undefined;
    if (d.partnerCode) {
      const partner = await prisma.partner.findUnique({ where: { code: d.partnerCode } });
      partnerId = partner?.id;
    }

    const auth = getAuth(req);
    const order = await prisma.$transaction(async (tx) => {
      const o = await tx.order.create({
        data: {
          orderNumber: orderNo(),
          userId: auth?.userId,
          partnerId,
          customerName: d.customerName,
          email: d.email.toLowerCase(),
          phone: d.phone,
          address: d.address,
          city: d.city,
          subtotal,
          deliveryFee,
          total: subtotal + deliveryFee,
          paymentMethod: d.paymentMethod,
          items: {
            create: d.items.map((i) => ({
              productId: i.productId,
              productName: map.get(i.productId)!.name,
              quantity: i.quantity,
              unitPrice: map.get(i.productId)!.price,
            })),
          },
        },
      });
      for (const i of d.items) {
        await tx.product.update({ where: { id: i.productId }, data: { stock: { decrement: i.quantity } } });
      }
      return o;
    });

    return NextResponse.json(
      { order: { id: order.id, orderNumber: order.orderNumber, total: order.total, status: order.status } },
      { status: 201 }
    );
  } catch (e) {
    return handleError(e);
  }
}

// Admin order list, optionally filtered by status.
export async function GET(req: NextRequest) {
  try {
    requireRole(req, Role.ADMIN);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const orders = await prisma.order.findMany({
      where: status ? { status: status as OrderStatus } : undefined,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json({ orders });
  } catch (e) {
    return handleError(e);
  }
}
