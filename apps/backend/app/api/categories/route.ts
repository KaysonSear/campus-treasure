import { prisma, successResponse, errors, getOrSet, cacheKeys } from '@/lib';

// 获取分类列表
export async function GET() {
  try {
    const categories = await getOrSet(
      cacheKeys.category(),
      async () => {
        return prisma.category.findMany({
          orderBy: { sort: 'asc' },
          select: {
            id: true,
            name: true,
            icon: true,
            parentId: true,
          },
        });
      },
      3600 * 24 // 缓存24小时
    );

    return successResponse(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    return errors.internal('获取分类列表失败');
  }
}
