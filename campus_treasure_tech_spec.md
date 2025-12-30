# "校园宝" (Campus Treasure Lite) 技术需求文档

## 项目信息

**项目名称：** 校园宝 (Campus Treasure) Lite  
**项目类型：** 校园二手交易演示平台  
**开发团队：**

- 2408200135 谢凯翔
- 2401050122 周欣乐

**文档版本：** v2.0 (精简版)  
**更新日期：** 2025-12-29

---

## 目录

1. [技术架构概述](#1-技术架构概述)
2. [技术栈详细说明](#2-技术栈详细说明)
3. [功能需求](#3-功能需求)
4. [开发环境配置](#4-开发环境配置)
5. [项目结构](#5-项目结构)
6. [数据库设计](#6-数据库设计)
7. [API接口设计](#7-api接口设计)

---

## 1. 技术架构概述

### 1.1 整体架构

本项目采用精简的前后端分离架构，专注于核心流程演示，完全基于本地 Docker 环境运行，无外部云服务依赖。

```
┌─────────────────────────────────────────────────────────┐
│                    移动端 (Mobile)                        │
│              React Native + Expo + NativeWind           │
│  ┌──────────┬──────────┬──────────┬──────────┐         │
│  │  物品浏览 │  发布闲置 │  消息聊天 │  个人中心 │         │
│  └──────────┴──────────┴──────────┴──────────┘         │
└─────────────────────┬───────────────────────────────────┘
                      │ REST API / WebSocket
                      ↓
┌─────────────────────────────────────────────────────────┐
│                  后端服务 (Backend)                       │
│              Next.js 16 + Prisma + TypeScript           │
│  ┌──────────┬──────────┬──────────┬──────────┐         │
│  │  API路由  │  JWT认证 │  业务逻辑 │  SocketIO │         │
│  └──────────┴──────────┴──────────┴──────────┘         │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────┐
│                  数据层 (Docker)                         │
│  ┌──────────────────┬─────────────────┐                 │
│  │     MongoDB      │      Redis      │                 │
│  │   (业务数据)      │   (缓存/会话)    │                 │
│  └──────────────────┴─────────────────┘                 │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 技术栈详细说明

### 2.1 移动端

- **框架**: React Native (Expo SDK 52)
- **语言**: TypeScript
- **UI**: NativeWind (Tailwind CSS)
- **状态管理**: Zustand
- **数据请求**: React Query + Axios

### 2.2 后端

- **框架**: Next.js 16.1 (App Router)
- **语言**: TypeScript
- **数据库**: MongoDB (via Prisma ORM)
- **缓存**: Redis
- **实时通信**: Socket.io (用于聊天)
- **认证**: JWT (jose)

### 2.3 开发工具

- **包管理**: pnpm (Workspaces Monorepo)
- **环境**: Docker Compose

---

## 3. 功能需求

### 3.1 用户认证 (User Auth)

- [x] **注册/登录**: 支持手机号注册与密码登录。
- [x] **个人信息**: 头像上传、昵称修改、学校信息设置。
- [ ] **认证拦截**: 基于 JWT 的 API 访问控制。

### 3.2 物品交易 (Marketplace)

- [ ] **发布物品**: 上传图片（Base64/本地存储）、填写标题描述、价格、分类。
- [ ] **物品列表**: 首页流式展示，支持按分类筛选、关键词搜索。
- [ ] **物品详情**: 展示图片轮播、卖家信息、商品状态。
- [ ] **收藏功能**: 收藏感兴趣的物品。

### 3.3 订单流程 (Trade)

- [ ] **下单**: 创建购买订单。
- [ ] **模拟支付**: 点击"支付"按钮即完成模拟扣款，状态流转为"待发货"。
- [ ] **订单管理**: 查看买入/卖出的订单列表，支持状态流转（发货/收货/完成）。

### 3.4 即时通讯 (Chat)

- [ ] **私聊**: 买卖双方一对一文本聊天。
- [ ] **离线消息**: 简单的消息持久化存储。

---

## 4. 开发环境配置

### 4.1 核心依赖

- **Node.js**: >= 18 (推荐 v20 LTS)
- **pnpm**: >= 9
- **Docker**: 用于运行 MongoDB 和 Redis

### 4.2 启动步骤

1. **启动数据库**:
   ```bash
   docker-compose -f docker/docker-compose.yml up -d
   ```
2. **安装依赖**:
   ```bash
   pnpm install
   ```
3. **启动服务**:
   ```bash
   npm run dev
   ```

---

## 5. 项目结构

采用 Monorepo 结构：

```
campus-treasure/
├── apps/
│   ├── mobile/    # Expo 移动端
│   └── backend/   # Next.js 后端 API
├── packages/
│   ├── shared-types/ # 共享类型定义
│   └── shared-utils/ # 共享工具函数
└── docker/           # Docker 配置
```

---

## 6. 数据库设计 (Prisma Schema 核心)

### User (用户)

```prisma
model User {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  phone       String   @unique
  password    String
  nickname    String
  avatar      String?
  school      String?
  createdAt   DateTime @default(now())

  items       Item[]
  orders      Order[]
  messages    Message[]
}
```

### Item (物品)

```prisma
model Item {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  description String
  price       Float
  images      String[]
  category    String
  status      String   @default("available") // available, sold
  sellerId    String   @db.ObjectId
  seller      User     @relation(fields: [sellerId], references: [id])
  createdAt   DateTime @default(now())
}
```

### Order (订单)

```prisma
model Order {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  itemId      String   @db.ObjectId
  buyerId     String   @db.ObjectId
  amount      Float
  status      String   @default("pending") // pending, paid, shipped, completed
  createdAt   DateTime @default(now())
}
```

---

## 7. API 接口设计

### 基础 URL

`http://localhost:3000/api`

### 核心接口

| 方法 | 路径              | 描述                         |
| ---- | ----------------- | ---------------------------- |
| POST | `/auth/register`  | 用户注册                     |
| POST | `/auth/login`     | 用户登录                     |
| GET  | `/users/me`       | 获取当前用户信息             |
| GET  | `/items`          | 获取物品列表 (支持搜索/筛选) |
| POST | `/items`          | 发布新物品                   |
| GET  | `/items/:id`      | 获取物品详情                 |
| POST | `/orders`         | 创建订单                     |
| POST | `/orders/:id/pay` | 模拟支付                     |
| GET  | `/orders`         | 获取我的订单                 |
