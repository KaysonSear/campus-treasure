import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma, successResponse, errors, parseBody, env } from '@/lib';

const registerSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号'),
  password: z.string().min(6, '密码至少需要6位'),
  nickname: z.string().min(2, '昵称至少2个字符').optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. 解析请求体
    const result = await parseBody(request, registerSchema);
    if ('error' in result) {
      return result.error;
    }
    const { phone, password, nickname } = result.data;

    // 2. 检查手机号是否已注册
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return errors.badRequest('该手机号已注册');
    }

    // 3. 加密密码
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. 创建用户
    // 如果没有提供昵称，生成默认昵称
    const finalNickname = nickname || `用户${phone.slice(-4)}`;

    // 生成随机头像 (使用 DiceBear API)
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`;

    const user = await prisma.user.create({
      data: {
        phone,
        passwordHash,
        nickname: finalNickname,
        avatar: defaultAvatar,
      },
      select: {
        id: true,
        phone: true,
        nickname: true,
        avatar: true,
        createdAt: true,
      },
    });

    // 5. 生成 JWT Token
    // 注意: 这里生成的 token 签名必须与 verifyToken 中使用的 secret 一致
    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET || 'fallback-secret-for-dev', {
      expiresIn: '7d',
    });

    // 6. 返回结果
    return successResponse({
      user,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    return errors.internal('注册失败，请稍后重试');
  }
}
