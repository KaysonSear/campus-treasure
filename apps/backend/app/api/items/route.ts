import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma, successResponse, errors, cacheKeys, getOrSet } from '@/lib';

// 查询参数 schema
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(20),
  categoryId: z.string().optional(),
  schoolId: z.string().optional(),
  status: z.enum(['available', 'sold', 'rented']).optional(),
  type: z.enum(['sale', 'rent']).optional(),
  keyword: z.string().optional(),
  sortBy: z.enum(['createdAt', 'price', 'views']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// 获取物品列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = {
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '20',
      categoryId: searchParams.get('categoryId') || undefined,
      schoolId: searchParams.get('schoolId') || undefined,
      status: searchParams.get('status') || undefined,
      type: searchParams.get('type') || undefined,
      keyword: searchParams.get('keyword') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const parsed = querySchema.safeParse(params);
    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const { page, pageSize, categoryId, schoolId, status, type, keyword, sortBy, sortOrder } =
      parsed.data;

    // 构建查询条件
    const where: Record<string, unknown> = {
      status: status || 'available',
    };

    if (categoryId) where.categoryId = categoryId;
    if (schoolId) where.schoolId = schoolId;
    if (type) where.type = type;
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // 查询数据
    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          title: true,
          price: true,
          originalPrice: true,
          images: true,
          condition: true,
          status: true,
          type: true,
          views: true,
          createdAt: true,
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
      }),
      prisma.item.count({ where }),
    ]);

    return successResponse(items, {
      page,
      pageSize,
      total,
    });
  } catch (error) {
    console.error('Get items error:', error);
    return errors.internal('获取物品列表失败');
  }
}
