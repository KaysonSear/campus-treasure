import { NextRequest } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { prisma, successResponse, errors, parseBody, env } from '@/lib';

// 创建订单Schema
const createOrderSchema = z.object({
  itemId: z.string(),
  deliveryType: z.enum(['delivery', 'pickup']),
  address: z.string().optional(),
  contactPhone: z.string().min(11),
  remark: z.string().optional(),
});

// 生成订单号
function generateOrderNo() {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T.]/g, '')
    .slice(0, 14);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `ORD${timestamp}${random}`;
}

// 验证Token
function getUserId(req: NextRequest): string | null {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return errors.unauthorized();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return errors.unauthorized();

  const result = await parseBody(req, createOrderSchema);
  if ('error' in result) return result.error;
  const data = result.data;

  // 1. 检查物品状态
  const item = await prisma.item.findUnique({
    where: { id: data.itemId },
    include: { seller: true },
  });

  if (!item) return errors.notFound('物品不存在');
  if (item.status !== 'available') return errors.badRequest('物品已售出或下架');
  if (item.sellerId === user.id) return errors.badRequest('不能购买自己的物品');

  // 2. 开启事务
  try {
    const order = await prisma.$transaction(async (tx) => {
      await tx.item.update({
        where: { id: item.id },
        data: { status: 'sold' },
      });

      return await tx.order.create({
        data: {
          orderNo: generateOrderNo(),
          itemId: item.id,
          buyerId: user.id,
          sellerId: item.sellerId,
          type: 'purchase',
          amount: item.price,
          status: 'pending',
          deliveryType: data.deliveryType,
          address: data.address,
          contactPhone: data.contactPhone,
        },
      });
    });

    return successResponse(order);
  } catch (err) {
    console.error('Create order error:', err);
    return errors.internal('创建订单失败');
  }
}

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return errors.unauthorized();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return errors.unauthorized();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'buy';
  const status = searchParams.get('status');

  const where: any = {};

  if (type === 'sell') {
    where.sellerId = user.id;
  } else {
    where.buyerId = user.id;
  }

  if (status && status !== 'all') {
    where.status = status;
  }

  try {
    const orders = await prisma.order.findMany({
      where,
      include: {
        item: {
          select: {
            id: true,
            title: true,
            images: true,
            price: true,
          },
        },
        seller: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        buyer: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(orders);
  } catch (err) {
    console.error('List orders error:', err);
    return errors.internal('获取订单列表失败');
  }
}
