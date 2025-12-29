import { NextRequest } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { prisma, successResponse, errors, env } from '@/lib';

// 创建物品 schema
const createItemSchema = z.object({
  title: z.string().min(2, '标题至少2个字符').max(50, '标题最多50个字符'),
  description: z.string().min(10, '描述至少10个字符').max(2000, '描述最多2000个字符'),
  price: z.number().min(0.01, '价格必须大于0'),
  originalPrice: z.number().optional(),
  images: z.array(z.string().url()).min(1, '至少上传1张图片').max(9, '最多9张图片'),
  condition: z.enum(['全新', '9成新', '8成新', '7成新', '6成新以下']),
  categoryId: z.string(),
  location: z.string().optional(),
  type: z.enum(['sale', 'rent']).default('sale'),
});

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

// 发布物品
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return errors.unauthorized('请先登录');
    }

    const body = await request.json();
    const parsed = createItemSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const {
      title,
      description,
      price,
      originalPrice,
      images,
      condition,
      categoryId,
      location,
      type,
    } = parsed.data;

    // 获取用户的学校ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { schoolId: true },
    });

    if (!user?.schoolId) {
      return errors.badRequest('请先设置学校信息');
    }

    // 验证分类是否存在
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return errors.badRequest('分类不存在');
    }

    // 创建物品
    const item = await prisma.item.create({
      data: {
        title,
        description,
        price,
        originalPrice,
        images,
        condition,
        categoryId,
        sellerId: userId,
        schoolId: user.schoolId,
        location,
        type,
        status: 'available',
        views: 0,
      },
      include: {
        seller: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return successResponse(item);
  } catch (error) {
    console.error('Create item error:', error);
    return errors.internal('发布物品失败');
  }
}
