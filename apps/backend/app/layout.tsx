import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '校园宝 API',
  description: '校园二手交易平台后端服务',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
