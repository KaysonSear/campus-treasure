export interface Category {
  id: string;
  name: string;
  icon?: string;
  parentId?: string;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  condition: string;
  status: string;
  type: string;
  views: number;
  createdAt: string;
  seller: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  category: {
    id: string;
    name: string;
  };
}

export interface Order {
  id: string;
  orderNo: string;
  itemId: string;
  item: Item;
  buyerId: string;
  buyer: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  sellerId: string;
  seller: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  amount: number;
  status: 'pending' | 'paid' | 'shipping' | 'completed' | 'cancelled';
  deliveryType: 'delivery' | 'pickup';
  address?: string;
  contactPhone: string;
  createdAt: string;
}
