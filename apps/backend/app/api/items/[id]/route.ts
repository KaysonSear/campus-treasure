import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma, successResponse, errors, env, invalidate } from '@/lib';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// 验证token
function getUserIdFromToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, env.JWT_SECRET || 'fallback-secret-for-dev') as {
      userId: string;
    };
    return decoded.userId;
  } catch {
    return null;
  }
}

// 获取物品详情
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            creditScore: true,
            creditLevel: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!item) {
      return errors.notFound('物品不存在');
    }

    // 增加浏览量
    await prisma.item.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return successResponse({ ...item, views: item.views + 1 });
  } catch (error) {
    console.error('Get item detail error:', error);
    return errors.internal('获取物品详情失败');
  }
}

// 更新物品
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return errors.unauthorized('请先登录');
    }

    const { id } = await params;

    // 检查物品是否存在且属于当前用户
    const existingItem = await prisma.item.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!existingItem) {
      return errors.notFound('物品不存在');
    }

    if (existingItem.sellerId !== userId) {
      return errors.forbidden('无权修改此物品');
    }

    const body = await request.json();
    const allowedFields = ['title', 'description', 'price', 'images', 'condition', 'status'];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const item = await prisma.item.update({
      where: { id },
      data: updateData,
    });

    // 清除缓存
    await invalidate(`item:${id}`);

    return successResponse(item);
  } catch (error) {
    console.error('Update item error:', error);
    return errors.internal('更新物品失败');
  }
}

// 删除物品(软删除)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return errors.unauthorized('请先登录');
    }

    const { id } = await params;

    const existingItem = await prisma.item.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!existingItem) {
      return errors.notFound('物品不存在');
    }

    if (existingItem.sellerId !== userId) {
      return errors.forbidden('无权删除此物品');
    }

    // 软删除:将状态改为removed
    await prisma.item.update({
      where: { id },
      data: { status: 'removed' },
    });

    // 清除缓存
    await invalidate(`item:${id}`);

    return successResponse({ message: '删除成功' });
  } catch (error) {
    console.error('Delete item error:', error);
    return errors.internal('删除物品失败');
  }
}
