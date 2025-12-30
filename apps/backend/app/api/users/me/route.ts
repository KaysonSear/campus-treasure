import { NextRequest } from 'next/server';
import { prisma, successResponse, errors, requireUser } from '@/lib';

// 获取当前用户信息
export async function GET(request: NextRequest) {
  try {
    const authResult = requireUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { userId } = authResult;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        nickname: true,
        avatar: true,
        school: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return errors.notFound('用户不存在');
    }

    return successResponse(user);
  } catch (error) {
    console.error('Get profile error:', error);
    return errors.internal('获取用户信息失败');
  }
}

// 更新用户信息
export async function PATCH(request: NextRequest) {
  try {
    const authResult = requireUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { userId } = authResult;

    const body = await request.json();
    const allowedFields = ['nickname', 'avatar'];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return errors.badRequest('没有要更新的字段');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        phone: true,
        nickname: true,
        avatar: true,
        updatedAt: true,
      },
    });

    return successResponse(user);
  } catch (error) {
    console.error('Update profile error:', error);
    return errors.internal('更新用户信息失败');
  }
}
