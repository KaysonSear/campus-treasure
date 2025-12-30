import { NextRequest, NextResponse } from 'next/server';
import { prisma, env } from '@/lib';
import jwt from 'jsonwebtoken';

// Helper to get user from token
async function getCurrentUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, env.JWT_SECRET || 'fallback-secret-for-dev') as {
      userId: string;
    };

    if (!decoded.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    return user;
  } catch {
    return null;
  }
}

// POST /api/items/:id/favorite - 收藏/取消收藏物品
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '请先登录' } },
        { status: 401 }
      );
    }

    const { id: itemId } = params;

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_itemId: {
          userId: user.id,
          itemId,
        },
      },
    });

    if (existingFavorite) {
      // 如果已收藏，则取消收藏
      await prisma.favorite.delete({
        where: {
          id: existingFavorite.id,
        },
      });
      return NextResponse.json({ success: true, data: { isFavorite: false } });
    } else {
      // 如果未收藏，则添加收藏
      await prisma.favorite.create({
        data: {
          userId: user.id,
          itemId,
        },
      });
      return NextResponse.json({ success: true, data: { isFavorite: true } });
    }
  } catch (error) {
    console.error('Favorite toggle error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '操作失败' } },
      { status: 500 }
    );
  }
}
