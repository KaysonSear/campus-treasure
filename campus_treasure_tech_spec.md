# "校园宝" Android App 技术需求文档

## 项目信息

**项目名称：** 校园宝 (Campus Treasure)  
**项目类型：** Android移动应用 + Web后端  
**开发团队：**
- 2408200135  谢凯翔
- 2401050122  周欣乐

**文档版本：** v1.0  
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
8. [核心功能实现](#8-核心功能实现)
9. [部署方案](#9-部署方案)
10. [开发规范](#10-开发规范)
11. [开发路线图](#11-开发路线图)

---

## 1. 技术架构概述

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    移动端 (Android)                      │
│              React Native + Expo + TypeScript            │
│  ┌──────────┬──────────┬──────────┬──────────┐         │
│  │  物品交易 │  物品租赁 │  消息通知 │  个人中心 │         │
│  └──────────┴──────────┴──────────┴──────────┘         │
└─────────────────────┬───────────────────────────────────┘
                      │ REST API / GraphQL
                      ↓
┌─────────────────────────────────────────────────────────┐
│                  后端服务 (Backend)                       │
│              Next.js 16.1.1 + TypeScript + Prisma            │
│  ┌──────────┬──────────┬──────────┬──────────┐         │
│  │  API路由  │  认证授权 │  业务逻辑 │  文件处理 │         │
│  └──────────┴──────────┴──────────┴──────────┘         │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────┐
│                    数据层 (Database)                      │
│  ┌──────────────────┬─────────────────┬──────────────┐ │
│  │   MongoDB Atlas   │   Redis Cache   │   OSS存储    │ │
│  │   (主数据库)       │   (缓存层)      │  (图片/文件)  │ │
│  └──────────────────┴─────────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────┘
                      
┌─────────────────────────────────────────────────────────┐
│               容器化部署 (Docker + Docker Compose)         │
│  ┌────────────┬────────────┬────────────┬──────────┐   │
│  │ Next.js容器│ MongoDB容器 │ Redis容器   │ Nginx容器 │   │
│  └────────────┴────────────┴────────────┴──────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 1.2 架构特点

- **前后端分离**：移动端通过RESTful API与后端通信
- **跨平台开发**：使用Expo实现一套代码同时支持Android/iOS
- **容器化部署**：Docker确保开发环境与生产环境一致
- **云原生**：支持快速扩展和微服务架构演进
- **类型安全**：全栈TypeScript保证代码质量

---

## 2. 技术栈详细说明

### 2.1 移动端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **React Native** | 0.76+ | 移动应用开发框架 |
| **Expo** | SDK 52+ | 开发工具链和原生API访问 |
| **TypeScript** | 5.6+ | 类型安全的JavaScript超集 |
| **React Navigation** | 7.x | 应用导航和路由 |
| **Zustand** | 5.x | 轻量级状态管理 |
| **React Query** | 5.x | 服务端状态管理和数据获取 |
| **React Hook Form** | 7.x | 表单处理 |
| **Zod** | 3.x | 运行时类型验证 |
| **NativeWind** | 4.x | Tailwind CSS for React Native |
| **Expo Image Picker** | 15.x | 图片选择和相机 |
| **Expo Location** | 17.x | 地理位置服务 |
| **Expo Notifications** | 0.29+ | 推送通知 |

### 2.2 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 15.1+ | React全栈框架（App Router） |
| **TypeScript** | 5.6+ | 类型安全开发 |
| **Prisma** | 6.x | ORM数据库工具 |
| **MongoDB** | 8.x | NoSQL数据库 |
| **Redis** | 7.x | 缓存和会话存储 |
| **NextAuth.js** | 5.x | 认证解决方案 |
| **Zod** | 3.x | API参数验证 |
| **Socket.io** | 4.x | WebSocket实时通信 |
| **Sharp** | 0.33+ | 图片处理 |
| **bcrypt** | 5.x | 密码加密 |

### 2.3 开发工具

| 工具 | 版本 | 用途 |
|------|------|------|
| **Docker** | 27.x+ | 容器化 |
| **Docker Compose** | 2.30+ | 多容器编排 |
| **pnpm** | 9.x+ | 包管理器（推荐） |
| **ESLint** | 9.x | 代码检查 |
| **Prettier** | 3.x | 代码格式化 |
| **Husky** | 9.x | Git钩子 |
| **VS Code** | Latest | 推荐IDE |

### 2.4 云服务

| 服务 | 提供商 | 用途 |
|------|--------|------|
| **数据库** | MongoDB Atlas | 托管数据库服务 |
| **对象存储** | 阿里云OSS/腾讯云COS | 图片和文件存储 |
| **CDN** | 阿里云CDN | 静态资源加速 |
| **推送服务** | 极光推送/Firebase | 消息推送 |
| **短信服务** | 阿里云短信 | 验证码发送 |

---

## 3. 功能需求

### 3.1 用户认证模块

#### 3.1.1 注册登录
- [ ] 手机号注册（短信验证码）
- [ ] 学生身份认证（学号+姓名+学校验证）
- [ ] 密码登录
- [ ] 忘记密码/重置密码
- [ ] 第三方登录（微信/QQ）
- [ ] 自动登录（Token持久化）

#### 3.1.2 个人资料
- [ ] 查看/编辑个人信息
- [ ] 头像上传（裁剪功能）
- [ ] 实名认证状态显示
- [ ] 信用等级显示

### 3.2 物品交易模块

#### 3.2.1 发布物品
- [ ] 拍照/从相册选择图片（最多9张）
- [ ] 图片裁剪和压缩
- [ ] 物品分类选择（多级分类）
- [ ] 物品标题和描述
- [ ] 价格设置
- [ ] 物品成色选择（全新/9成新/8成新等）
- [ ] 交易方式选择（配送/自提）
- [ ] 定位功能（自动获取校区位置）
- [ ] 草稿保存

#### 3.2.2 浏览物品
- [ ] 首页feed流（推荐算法）
- [ ] 分类浏览
- [ ] 搜索功能（关键词+筛选）
- [ ] 物品详情页
- [ ] 图片预览（缩放/滑动）
- [ ] 卖家信息查看
- [ ] 收藏/分享功能
- [ ] 举报不当内容

#### 3.2.3 交易流程
- [ ] 在线议价（即时通讯）
- [ ] 下单购买
- [ ] 支付集成（微信/支付宝）
- [ ] 订单状态跟踪
- [ ] 订单评价
- [ ] 退款/售后申请

### 3.3 物品租赁模块

#### 3.3.1 发布租赁
- [ ] 设置租赁价格（日/周/月）
- [ ] 设置押金金额
- [ ] 可租时间段设置
- [ ] 租赁规则说明

#### 3.3.2 租赁流程
- [ ] 租赁下单
- [ ] 押金托管
- [ ] 租期倒计时
- [ ] 续租申请
- [ ] 归还验收
- [ ] 押金退还
- [ ] 违约处理

### 3.4 消息通知模块

#### 3.4.1 即时通讯
- [ ] 一对一聊天
- [ ] 文本消息
- [ ] 图片消息
- [ ] 位置分享
- [ ] 消息已读/未读状态
- [ ] 消息推送

#### 3.4.2 系统通知
- [ ] 订单状态通知
- [ ] 评价提醒
- [ ] 活动通知
- [ ] 违约提醒

### 3.5 配送服务模块

- [ ] 校园配送下单
- [ ] 配送员接单
- [ ] 实时位置追踪
- [ ] 配送完成确认
- [ ] 配送评价

### 3.6 信用体系模块

- [ ] 信用分显示
- [ ] 交易记录查看
- [ ] 评价管理
- [ ] 信用等级特权说明
- [ ] 违约记录查询

### 3.7 环保积分模块

- [ ] 积分余额显示
- [ ] 积分获取记录
- [ ] 积分兑换商城
- [ ] 积分排行榜
- [ ] 公益捐赠

### 3.8 个人中心模块

#### 3.8.1 我的物品
- [ ] 发布中的物品
- [ ] 已卖出的物品
- [ ] 已下架的物品
- [ ] 编辑/删除物品

#### 3.8.2 我的订单
- [ ] 购买订单
- [ ] 销售订单
- [ ] 租赁订单
- [ ] 订单筛选和搜索

#### 3.8.3 我的收藏
- [ ] 收藏的物品列表
- [ ] 取消收藏
- [ ] 收藏夹分类

#### 3.8.4 设置
- [ ] 账号安全设置
- [ ] 通知设置
- [ ] 隐私设置
- [ ] 关于我们
- [ ] 用户协议
- [ ] 退出登录

---

## 4. 开发环境配置

### 4.1 Windows 11 环境配置

#### 4.1.1 安装Node.js和pnpm

```powershell
# 使用 Scoop 安装 (推荐)
# 先安装 Scoop: https://scoop.sh
iwr -useb get.scoop.sh | iex

# 安装 Node.js 20+
scoop install nodejs-lts

# 安装 pnpm
npm install -g pnpm

# 验证安装
node --version  # v20.x.x
pnpm --version  # 9.x.x
```

#### 4.1.2 安装Docker Desktop

```powershell
# 下载并安装 Docker Desktop for Windows
# https://www.docker.com/products/docker-desktop/

# 启动后验证
docker --version
docker-compose --version
```

#### 4.1.3 安装Android Studio

```powershell
# 下载 Android Studio
# https://developer.android.com/studio

# 配置环境变量 (在系统环境变量中添加)
ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
Path=%Path%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools
```

#### 4.1.4 安装Expo CLI

```powershell
pnpm add -g expo-cli eas-cli
```

### 4.2 Ubuntu 25.10 环境配置

#### 4.2.1 安装Node.js和pnpm

```bash
# 使用 nvm 安装 Node.js (推荐)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc

# 安装 Node.js 20+
nvm install 20
nvm use 20

# 安装 pnpm
npm install -g pnpm

# 验证安装
node --version
pnpm --version
```

#### 4.2.2 安装Docker

```bash
# 更新包索引
sudo apt update

# 安装 Docker
sudo apt install docker.io docker-compose -y

# 添加当前用户到 docker 组
sudo usermod -aG docker $USER
newgrp docker

# 验证安装
docker --version
docker-compose --version
```

#### 4.2.3 安装Android Studio

```bash
# 下载 Android Studio
# https://developer.android.com/studio

# 解压到 /opt
sudo tar -xzf android-studio-*.tar.gz -C /opt

# 配置环境变量
echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/emulator' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc
source ~/.bashrc
```

#### 4.2.4 安装Expo CLI

```bash
pnpm add -g expo-cli eas-cli
```

### 4.3 开发工具配置

#### 4.3.1 VS Code 推荐扩展

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "expo.vscode-expo-tools",
    "mongodb.mongodb-vscode"
  ]
}
```

#### 4.3.2 VS Code 工作区配置

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

---

## 5. 项目结构

### 5.1 Monorepo 结构

```
campus-treasure/
├── apps/
│   ├── mobile/                    # Expo React Native 移动端
│   │   ├── app/                   # Expo Router 路由
│   │   │   ├── (auth)/           # 认证相关页面
│   │   │   │   ├── login.tsx
│   │   │   │   ├── register.tsx
│   │   │   │   └── verify.tsx
│   │   │   ├── (tabs)/           # 主要标签页
│   │   │   │   ├── index.tsx     # 首页
│   │   │   │   ├── category.tsx  # 分类
│   │   │   │   ├── publish.tsx   # 发布
│   │   │   │   ├── messages.tsx  # 消息
│   │   │   │   └── profile.tsx   # 我的
│   │   │   ├── item/
│   │   │   │   └── [id].tsx      # 物品详情
│   │   │   ├── order/
│   │   │   │   ├── index.tsx     # 订单列表
│   │   │   │   └── [id].tsx      # 订单详情
│   │   │   └── _layout.tsx       # 根布局
│   │   ├── components/            # 共享组件
│   │   │   ├── ui/               # UI组件
│   │   │   ├── layout/           # 布局组件
│   │   │   └── features/         # 功能组件
│   │   ├── hooks/                 # 自定义Hooks
│   │   ├── lib/                   # 工具函数
│   │   ├── store/                 # Zustand状态管理
│   │   ├── types/                 # TypeScript类型
│   │   ├── app.json               # Expo配置
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── backend/                   # Next.js 后端
│       ├── app/                   # Next.js 16.1.1 App Router
│       │   ├── api/              # API路由
│       │   │   ├── auth/         # 认证相关API
│       │   │   ├── items/        # 物品相关API
│       │   │   ├── orders/       # 订单相关API
│       │   │   ├── users/        # 用户相关API
│       │   │   └── upload/       # 文件上传API
│       │   └── layout.tsx
│       ├── lib/
│       │   ├── db/               # 数据库连接
│       │   │   ├── prisma.ts
│       │   │   └── redis.ts
│       │   ├── auth/             # 认证逻辑
│       │   ├── utils/            # 工具函数
│       │   └── validators/       # Zod验证器
│       ├── prisma/
│       │   ├── schema.prisma     # Prisma模型定义
│       │   └── migrations/       # 数据库迁移
│       ├── public/                # 静态资源
│       ├── middleware.ts          # Next.js中间件
│       ├── next.config.mjs
│       ├── package.json
│       └── tsconfig.json
│
├── packages/                      # 共享包
│   ├── shared-types/             # 共享TypeScript类型
│   │   ├── src/
│   │   │   ├── models/          # 数据模型类型
│   │   │   ├── api/             # API请求/响应类型
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── shared-utils/             # 共享工具函数
│       ├── src/
│       │   ├── format/          # 格式化工具
│       │   ├── validation/      # 验证工具
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── docker/                        # Docker配置
│   ├── Dockerfile.backend
│   ├── Dockerfile.nginx
│   └── docker-compose.yml
│
├── .github/                       # GitHub配置
│   └── workflows/
│       └── ci.yml
│
├── .vscode/                       # VS Code配置
│   ├── extensions.json
│   └── settings.json
│
├── .husky/                        # Git hooks
│   ├── pre-commit
│   └── pre-push
│
├── pnpm-workspace.yaml            # pnpm工作区配置
├── .gitignore
├── .prettierrc
├── .eslintrc.json
├── README.md
└── package.json                   # 根package.json
```

### 5.2 关键文件说明

#### pnpm-workspace.yaml
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

#### 根 package.json
```json
{
  "name": "campus-treasure",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev:mobile": "pnpm --filter mobile dev",
    "dev:backend": "pnpm --filter backend dev",
    "dev": "pnpm run dev:mobile & pnpm run dev:backend",
    "build:mobile": "pnpm --filter mobile build",
    "build:backend": "pnpm --filter backend build",
    "lint": "pnpm -r lint",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
    "type-check": "pnpm -r type-check",
    "docker:up": "docker-compose -f docker/docker-compose.yml up -d",
    "docker:down": "docker-compose -f docker/docker-compose.yml down"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0",
    "typescript": "^5.6.0"
  }
}
```

---

## 6. 数据库设计

### 6.1 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

// 用户模型
model User {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  phone         String    @unique
  password      String
  nickname      String
  avatar        String?
  studentId     String?   @unique
  schoolId      String?   @db.ObjectId
  school        School?   @relation(fields: [schoolId], references: [id])
  realName      String?
  isVerified    Boolean   @default(false)
  creditScore   Int       @default(100)
  creditLevel   String    @default("普通会员")
  ecoPoints     Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // 关联
  items         Item[]
  orders        Order[]
  reviews       Review[]
  conversations Conversation[]
  messages      Message[]

  @@map("users")
}

// 学校模型
model School {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String   @unique
  province  String
  city      String
  address   String
  users     User[]
  items     Item[]
  createdAt DateTime @default(now())

  @@map("schools")
}

// 物品分类
model Category {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String   @unique
  icon      String
  parentId  String?  @db.ObjectId
  parent    Category? @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  children  Category[] @relation("CategoryHierarchy")
  items     Item[]
  sortOrder Int      @default(0)

  @@map("categories")
}

// 物品模型
model Item {
  id            String      @id @default(auto()) @map("_id") @db.ObjectId
  title         String
  description   String
  price         Float
  originalPrice Float?
  images        String[]
  condition     String      // 全新/9成新/8成新等
  categoryId    String      @db.ObjectId
  category      Category    @relation(fields: [categoryId], references: [id])
  sellerId      String      @db.ObjectId
  seller        User        @relation(fields: [sellerId], references: [id])
  schoolId      String      @db.ObjectId
  school        School      @relation(fields: [schoolId], references: [id])
  location      String
  coordinates   Float[]     // [longitude, latitude]
  status        String      @default("available") // available/sold/rented
  type          String      // sale/rent
  rentPrice     Json?       // {daily: 10, weekly: 60, monthly: 200}
  deposit       Float?
  views         Int         @default(0)
  favorites     Int         @default(0)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  // 关联
  orders        Order[]
  reviews       Review[]

  @@map("items")
}

// 订单模型
model Order {
  id            String      @id @default(auto()) @map("_id") @db.ObjectId
  orderNo       String      @unique
  itemId        String      @db.ObjectId
  item          Item        @relation(fields: [itemId], references: [id])
  buyerId       String      @db.ObjectId
  buyer         User        @relation(fields: [buyerId], references: [id])
  type          String      // purchase/rent
  amount        Float
  deposit       Float?
  status        String      @default("pending") // pending/paid/shipping/completed/cancelled
  payMethod     String?     // wechat/alipay
  payTime       DateTime?
  deliveryType  String      // delivery/pickup
  deliveryFee   Float?
  address       String?
  contactPhone  String
  rentStartDate DateTime?
  rentEndDate   DateTime?
  returnDate    DateTime?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  // 关联
  review        Review?

  @@map("orders")
}

// 评价模型
model Review {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  orderId     String   @unique @db.ObjectId
  order       Order    @relation(fields: [orderId], references: [id])
  itemId      String   @db.ObjectId
  item        Item     @relation(fields: [itemId], references: [id])
  reviewerId  String   @db.ObjectId
  reviewer    User     @relation(fields: [reviewerId], references: [id])
  rating      Int      // 1-5星
  content     String?
  images      String[]
  createdAt   DateTime @default(now())

  @@map("reviews")
}

// 对话模型
model Conversation {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  participants  String[]  @db.ObjectId
  users         User[]    @relation(fields: [participants], references: [id])
  lastMessage   String?
  lastMessageAt DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // 关联
  messages      Message[]

  @@map("conversations")
}

// 消息模型
model Message {
  id             String       @id @default(auto()) @map("_id") @db.ObjectId
  conversationId String       @db.ObjectId
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  senderId       String       @db.ObjectId
  sender         User         @relation(fields: [senderId], references: [id])
  type           String       // text/image/location
  content        String
  isRead         Boolean      @default(false)
  createdAt      DateTime     @default(now())

  @@map("messages")
}

// 积分记录
model PointsRecord {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  amount      Int
  type        String   // earn/spend
  reason      String
  relatedId   String?  @db.ObjectId
  createdAt   DateTime @default(now())

  @@map("points_records")
}
```

### 6.2 数据库索引策略

```javascript
// MongoDB索引创建脚本

// 用户表索引
db.users.createIndex({ phone: 1 }, { unique: true });
db.users.createIndex({ studentId: 1 }, { unique: true });
db.users.createIndex({ schoolId: 1 });

// 物品表索引
db.items.createIndex({ categoryId: 1, status: 1 });
db.items.createIndex({ sellerId: 1 });
db.items.createIndex({ schoolId: 1, status: 1 });
db.items.createIndex({ title: "text", description: "text" }); // 全文搜索
db.items.createIndex({ coordinates: "2dsphere" }); // 地理位置查询

// 订单表索引
db.orders.createIndex({ orderNo: 1 }, { unique: true });
db.orders.createIndex({ buyerId: 1, status: 1 });
db.orders.createIndex({ itemId: 1 });

// 消息表索引
db.messages.createIndex({ conversationId: 1, createdAt: -1 });
db.messages.createIndex({ senderId: 1 });
```

---

## 7. API接口设计

### 7.1 RESTful API规范

#### 基础URL
```
开发环境: http://localhost:3000/api
生产环境: https://api.campustreasure.com/api
```

#### 通用响应格式

```typescript
// 成功响应
{
  "success": true,
  "data": any,
  "message": "操作成功"
}

// 错误响应
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {}
  }
}

// 分页响应
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### 7.2 API端点列表

#### 7.2.1 认证相关

```typescript
// POST /api/auth/register
// 用户注册
Request: {
  phone: string;
  code: string;
  password: string;
}
Response: {
  user: User;
  token: string;
}

// POST /api/auth/login
// 用户登录
Request: {
  phone: string;
  password: string;
}
Response: {
  user: User;
  token: string;
}

// POST /api/auth/send-code
// 发送验证码
Request: {
  phone: string;
  type: 'register' | 'login' | 'reset';
}

// POST /api/auth/verify-student
// 学生身份验证
Request: {
  studentId: string;
  realName: string;
  schoolId: string;
}
```

#### 7.2.2 用户相关

```typescript
// GET /api/users/me
// 获取当前用户信息

// PUT /api/users/me
// 更新用户信息
Request: {
  nickname?: string;
  avatar?: string;
}

// GET /api/users/:id
// 获取用户信息

// GET /api/users/:id/items
// 获取用户发布的物品
Query: {
  page?: number;
  pageSize?: number;
  status?: string;
}
```

#### 7.2.3 物品相关

```typescript
// GET /api/items
// 获取物品列表
Query: {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  schoolId?: string;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  type?: 'sale' | 'rent';
  sortBy?: 'createdAt' | 'price' | 'views';
  order?: 'asc' | 'desc';
}

// GET /api/items/:id
// 获取物品详情

// POST /api/items
// 发布物品
Request: {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  condition: string;
  categoryId: string;
  schoolId: string;
  location: string;
  coordinates: [number, number];
  type: 'sale' | 'rent';
  rentPrice?: {
    daily?: number;
    weekly?: number;
    monthly?: number;
  };
  deposit?: number;
}

// PUT /api/items/:id
// 更新物品信息

// DELETE /api/items/:id
// 删除物品

// POST /api/items/:id/favorite
// 收藏物品

// DELETE /api/items/:id/favorite
// 取消收藏
```

#### 7.2.4 订单相关

```typescript
// POST /api/orders
// 创建订单
Request: {
  itemId: string;
  type: 'purchase' | 'rent';
  deliveryType: 'delivery' | 'pickup';
  address?: string;
  contactPhone: string;
  rentStartDate?: string;
  rentEndDate?: string;
}

// GET /api/orders
// 获取订单列表
Query: {
  page?: number;
  pageSize?: number;
  status?: string;
  type?: 'buy' | 'sell';
}

// GET /api/orders/:id
// 获取订单详情

// POST /api/orders/:id/pay
// 支付订单
Request: {
  payMethod: 'wechat' | 'alipay';
}

// POST /api/orders/:id/cancel
// 取消订单

// POST /api/orders/:id/confirm
// 确认收货

// POST /api/orders/:id/review
// 评价订单
Request: {
  rating: number;
  content?: string;
  images?: string[];
}
```

#### 7.2.5 聊天相关

```typescript
// GET /api/conversations
// 获取对话列表

// GET /api/conversations/:id/messages
// 获取对话消息
Query: {
  page?: number;
  pageSize?: number;
}

// POST /api/conversations/:id/messages
// 发送消息
Request: {
  type: 'text' | 'image' | 'location';
  content: string;
}

// PUT /api/conversations/:id/read
// 标记消息已读
```

#### 7.2.6 文件上传

```typescript
// POST /api/upload/image
// 上传图片
Request: FormData {
  file: File;
}
Response: {
  url: string;
}

// POST /api/upload/images
// 批量上传图片
Request: FormData {
  files: File[];
}
Response: {
  urls: string[];
}
```

### 7.3 WebSocket事件

```typescript
// Socket.io事件定义

// 客户端 -> 服务器
{
  'join:conversation': { conversationId: string },
  'leave:conversation': { conversationId: string },
  'send:message': { conversationId: string, message: Message },
  'typing:start': { conversationId: string },
  'typing:stop': { conversationId: string }
}

// 服务器 -> 客户端
{
  'message:new': { message: Message },
  'message:read': { messageId: string },
  'typing:user': { userId: string, isTyping: boolean },
  'order:status': { orderId: string, status: string }
}
```

---

## 8. 核心功能实现

### 8.1 身份认证实现

#### 8.1.1 JWT Token策略

```typescript
// apps/backend/lib/auth/jwt.ts

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '7d';

export interface TokenPayload {
  userId: string;
  phone: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
```

#### 8.1.2 Next.js中间件认证

```typescript
// apps/backend/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth/jwt';

export function middleware(request: NextRequest) {
  // 公开路由
  const publicRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/send-code'];
  
  if (publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 验证Token
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json(
      { success: false, error: { message: '未授权' } },
      { status: 401 }
    );
  }

  try {
    const payload = verifyToken(token);
    // 将用户信息添加到请求头
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: 'Token无效' } },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: '/api/:path*',
};
```

#### 8.1.3 移动端Token存储

```typescript
// apps/mobile/lib/auth.ts

import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function deleteToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
```

### 8.2 图片上传实现

#### 8.2.1 后端上传处理

```typescript
// apps/backend/app/api/upload/image/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: { message: '未上传文件' } },
        { status: 400 }
      );
    }

    // 转换为Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 压缩图片
    const compressedBuffer = await sharp(buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    // 上传到OSS (这里使用Vercel Blob作为示例)
    const blob = await put(
      `items/${Date.now()}-${file.name}`,
      compressedBuffer,
      { access: 'public' }
    );

    return NextResponse.json({
      success: true,
      data: { url: blob.url },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: '上传失败' } },
      { status: 500 }
    );
  }
}
```

#### 8.2.2 移动端图片选择

```typescript
// apps/mobile/hooks/useImagePicker.ts

import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export function useImagePicker() {
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    // 请求权限
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('需要相册权限');
      return null;
    }

    // 选择图片
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('需要相机权限');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  };

  const uploadImage = async (uri: string) => {
    setLoading(true);
    try {
      // 压缩图片
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // 上传
      const formData = new FormData();
      formData.append('file', {
        uri: manipResult.uri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);

      const response = await fetch('http://localhost:3000/api/upload/image', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      return data.data.url;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    pickImage,
    takePhoto,
    uploadImage,
    loading,
  };
}
```

### 8.3 实时聊天实现

#### 8.3.1 Socket.io服务器

```typescript
// apps/backend/lib/socket.ts

import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyToken } from './auth/jwt';

export function initializeSocket(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  // 认证中间件
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const payload = verifyToken(token);
      socket.data.userId = payload.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.data.userId);

    // 加入对话房间
    socket.on('join:conversation', ({ conversationId }) => {
      socket.join(conversationId);
    });

    // 离开对话房间
    socket.on('leave:conversation', ({ conversationId }) => {
      socket.leave(conversationId);
    });

    // 发送消息
    socket.on('send:message', async ({ conversationId, message }) => {
      // 保存到数据库
      // const savedMessage = await saveMessage(...);
      
      // 广播给房间内其他用户
      socket.to(conversationId).emit('message:new', { message });
    });

    // 输入状态
    socket.on('typing:start', ({ conversationId }) => {
      socket.to(conversationId).emit('typing:user', {
        userId: socket.data.userId,
        isTyping: true,
      });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(conversationId).emit('typing:user', {
        userId: socket.data.userId,
        isTyping: false,
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.data.userId);
    });
  });

  return io;
}
```

#### 8.3.2 移动端Socket连接

```typescript
// apps/mobile/lib/socket.ts

import { io, Socket } from 'socket.io-client';
import { getToken } from './auth';

let socket: Socket | null = null;

export async function connectSocket() {
  const token = await getToken();
  
  socket = io('http://localhost:3000', {
    auth: { token },
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
```

---

## 9. 部署方案

### 9.1 Docker Compose配置

```yaml
# docker/docker-compose.yml

version: '3.8'

services:
  # Next.js后端服务
  backend:
    build:
      context: ../apps/backend
      dockerfile: ../../docker/Dockerfile.backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mongodb