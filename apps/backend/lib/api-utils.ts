import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z, ZodError } from 'zod';

// API响应类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

// 成功响应
export function successResponse<T>(
  data: T,
  meta?: ApiResponse['meta']
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    ...(meta && { meta }),
  });
}

// 错误响应
export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: unknown
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, ...(details && { details }) },
    },
    { status }
  );
}

// 常见错误
export const errors = {
  badRequest: (message = '请求参数错误') => errorResponse('BAD_REQUEST', message, 400),
  unauthorized: (message = '未登录或登录已过期') => errorResponse('UNAUTHORIZED', message, 401),
  forbidden: (message = '无权限访问') => errorResponse('FORBIDDEN', message, 403),
  notFound: (message = '资源不存在') => errorResponse('NOT_FOUND', message, 404),
  internal: (message = '服务器内部错误') => errorResponse('INTERNAL_ERROR', message, 500),
  validation: (error: ZodError) =>
    errorResponse('VALIDATION_ERROR', '参数验证失败', 400, error.flatten()),
};

// 解析请求体
export async function parseBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ data: T } | { error: NextResponse<ApiResponse> }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data };
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: errors.validation(error) };
    }
    return { error: errors.badRequest('无效的JSON格式') };
  }
}
