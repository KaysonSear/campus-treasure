import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma, successResponse, errors } from '@/lib';

// 搜索参数 schema
const searchSchema = z.object({
  q: z.string().min(1, '搜索关键词不能为空').max(100),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(20),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  condition: z.string().optional(),
  sortBy: z.enum(['createdAt', 'price']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * GET /api/items/search
 * 物品搜索API - 支持关键词、分类、价格区间、成色筛选
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = {
      q: searchParams.get('q') || '',
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '20',
      category: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      condition: searchParams.get('condition') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const parsed = searchSchema.safeParse(params);
    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const { q, page, pageSize, category, minPrice, maxPrice, condition, sortBy, sortOrder } =
      parsed.data;

    // 构建查询条件
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {
      status: 'available',
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    };

    // 分类筛选
    if (category) {
      where.category = category;
    }

    // 价格区间筛选
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // 成色筛选
    if (condition) {
      where.condition = condition;
    }

    // 执行查询
    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          images: true,
          condition: true,
          category: true,
          createdAt: true,
          seller: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.item.count({ where }),
    ]);

    return successResponse({
      keyword: q,
      items,
      pagination: {
        page,
        pageSize,
        total,
        hasMore: page * pageSize < total,
      },
      filters: {
        category,
        minPrice,
        maxPrice,
        condition,
      },
    });
  } catch (error) {
    console.error('Search items error:', error);
    return errors.internal('搜索物品失败');
  }
}
