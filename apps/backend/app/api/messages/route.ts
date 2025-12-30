import { NextRequest } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { prisma, successResponse, errors, parseBody, env } from '@/lib';

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

// 发送消息 Schema
const sendMessageSchema = z.object({
  receiverId: z.string().min(1, '接收者ID不能为空'),
  content: z.string().min(1, '消息内容不能为空').max(1000, '消息内容过长'),
  type: z.enum(['text', 'image']).default('text'),
});

/**
 * GET /api/messages
 * 获取消息列表 (对话列表或与特定用户的消息)
 */
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return errors.unauthorized();

  const { searchParams } = new URL(req.url);
  const withUserId = searchParams.get('with'); // 特定对话对象
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  try {
    if (withUserId) {
      // 获取与特定用户的消息记录
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: withUserId },
            { senderId: withUserId, receiverId: userId },
          ],
        },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          sender: {
            select: { id: true, nickname: true, avatar: true },
          },
        },
      });

      // 标记消息为已读
      await prisma.message.updateMany({
        where: {
          senderId: withUserId,
          receiverId: userId,
          isRead: false,
        },
        data: { isRead: true },
      });

      return successResponse({ messages });
    } else {
      // 获取对话列表 (最近联系人)
      const conversations = await prisma.message.findMany({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
        orderBy: { createdAt: 'desc' },
        distinct: ['senderId', 'receiverId'],
        take: 50,
        include: {
          sender: {
            select: { id: true, nickname: true, avatar: true },
          },
        },
      });

      // 构建对话列表 (去重对话对象)
      const contactMap = new Map<
        string,
        {
          user: { id: string; nickname: string; avatar: string | null };
          lastMessage: string;
          unreadCount: number;
          createdAt: Date;
        }
      >();

      for (const msg of conversations) {
        const contactId = msg.senderId === userId ? msg.receiverId : msg.senderId;
        if (!contactMap.has(contactId)) {
          // 获取联系人信息
          const contact = await prisma.user.findUnique({
            where: { id: contactId },
            select: { id: true, nickname: true, avatar: true },
          });

          if (contact) {
            // 获取未读消息数
            const unreadCount = await prisma.message.count({
              where: {
                senderId: contactId,
                receiverId: userId,
                isRead: false,
              },
            });

            contactMap.set(contactId, {
              user: contact,
              lastMessage: msg.content,
              unreadCount,
              createdAt: msg.createdAt,
            });
          }
        }
      }

      return successResponse({
        conversations: Array.from(contactMap.values()),
      });
    }
  } catch (error) {
    console.error('Get messages error:', error);
    return errors.internal('获取消息失败');
  }
}

/**
 * POST /api/messages
 * 发送消息
 */
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return errors.unauthorized();

  const result = await parseBody(req, sendMessageSchema);
  if ('error' in result) return result.error;

  const { receiverId, content, type } = result.data;

  // 检查接收者是否存在
  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { id: true, nickname: true },
  });

  if (!receiver) {
    return errors.notFound('接收者不存在');
  }

  // 不能给自己发消息
  if (receiverId === userId) {
    return errors.badRequest('不能给自己发送消息');
  }

  try {
    const message = await prisma.message.create({
      data: {
        senderId: userId,
        receiverId,
        content,
        type,
        isRead: false,
      },
      include: {
        sender: {
          select: { id: true, nickname: true, avatar: true },
        },
      },
    });

    return successResponse(message);
  } catch (error) {
    console.error('Send message error:', error);
    return errors.internal('发送消息失败');
  }
}
