/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 实验性功能
  experimental: {
    // 服务端操作
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // 图片域名白名单
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.aliyuncs.com',
      },
    ],
  },

  // 环境变量
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

module.exports = nextConfig;
