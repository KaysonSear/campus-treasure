/**
 * @xiaoyuanbao/shared-types
 * 校园宝共享类型定义
 */

// ============= 用户相关类型 =============
export interface User {
  id: string;
  phone: string;
  nickname: string;
  avatar?: string;
  studentId?: string;
  schoolId?: string;
  realName?: string;
  isVerified: boolean;
  creditScore: number;
  creditLevel: string;
  ecoPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============= 物品相关类型 =============
export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  condition: ItemCondition;
  categoryId: string;
  sellerId: string;
  schoolId: string;
  location: string;
  coordinates?: [number, number];
  status: ItemStatus;
  type: ItemType;
  views: number;
  favorites: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ItemCondition = '全新' | '9成新' | '8成新' | '7成新' | '6成新以下';
export type ItemStatus = 'available' | 'sold' | 'rented' | 'removed';
export type ItemType = 'sale' | 'rent';

// ============= 订单相关类型 =============
export interface Order {
  id: string;
  orderNo: string;
  itemId: string;
  buyerId: string;
  type: OrderType;
  amount: number;
  deposit?: number;
  status: OrderStatus;
  payMethod?: PayMethod;
  payTime?: Date;
  deliveryType: DeliveryType;
  deliveryFee?: number;
  address?: string;
  contactPhone: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderType = 'purchase' | 'rent';
export type OrderStatus = 'pending' | 'paid' | 'shipping' | 'completed' | 'cancelled';
export type PayMethod = 'wechat' | 'alipay';
export type DeliveryType = 'delivery' | 'pickup';

// ============= API响应类型 =============
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

// ============= 分页请求类型 =============
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
