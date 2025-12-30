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
  images: string[];
  condition: string;
  status: string;
  category: string;
  createdAt: string;
  seller: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  isFavorite?: boolean;
}

export interface Order {
  id: string;
  itemId: string;
  item: Item;
  buyerId: string;
  buyer: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  amount: number;
  status: 'pending' | 'paid' | 'shipping' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  sender: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  receiverId: string;
  content: string;
  type: 'text' | 'image';
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  user: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  lastMessage: string;
  unreadCount: number;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
