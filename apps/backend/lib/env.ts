import { z } from 'zod';

// 环境变量验证 schema
const envSchema = z.object({
  // 数据库
  DATABASE_URL: z.string().url(),

  // Redis (可选)
  REDIS_URL: z.string().url().optional(),

  // 认证
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  JWT_SECRET: z.string().min(32),

  // 应用
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // 阿里云 SMS (可选)
  ALIYUN_SMS_ACCESS_KEY_ID: z.string().optional(),
  ALIYUN_SMS_ACCESS_KEY_SECRET: z.string().optional(),

  // 阿里云 OSS (可选)
  ALIYUN_OSS_ACCESS_KEY_ID: z.string().optional(),
  ALIYUN_OSS_ACCESS_KEY_SECRET: z.string().optional(),
  ALIYUN_OSS_BUCKET: z.string().optional(),
  ALIYUN_OSS_REGION: z.string().optional(),
});

// 解析并验证环境变量
function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);

    // 在开发环境中只警告,不抛出错误
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment variables');
    }
  }

  return parsed.data ?? ({} as z.infer<typeof envSchema>);
}

export const env = validateEnv();

export type Env = z.infer<typeof envSchema>;
