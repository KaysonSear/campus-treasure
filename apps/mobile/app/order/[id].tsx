import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib';
import { Order } from '@/types';
import { useAuthStore } from '@/store';

const STATUS_MAP: Record<string, string> = {
  pending: '待支付',
  paid: '待发货',
  shipping: '待收货',
  completed: '已完成',
  cancelled: '已取消',
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get<Order>(`/orders/${id}`),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (action: string) => api.patch(`/orders/${id}`, { action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      Alert.alert('操作成功');
    },
    onError: (err: Error) => Alert.alert('操作失败', err.message),
  });

  if (isLoading || !order) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text>加载中...</Text>
      </SafeAreaView>
    );
  }

  const isBuyer = user?.id === order.buyerId;
  const isSeller = user?.id === order.sellerId;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-3 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-medium">订单详情</Text>
        <View className="w-5" />
      </View>

      <View className="p-4 bg-primary-500">
        <Text className="text-white text-lg font-bold">{STATUS_MAP[order.status]}</Text>
        <Text className="text-white text-sm opacity-80 mt-1">订单号: {order.orderNo}</Text>
      </View>

      <View className="bg-white mt-2 p-4">
        <Text className="text-gray-800 font-medium mb-2">收货信息</Text>
        <View className="flex-row">
          <Text className="text-gray-500 w-20">联系人</Text>
          <Text className="text-gray-800 flex-1">{order.contactPhone}</Text>
        </View>
        <View className="flex-row mt-2">
          <Text className="text-gray-500 w-20">配送方式</Text>
          <Text className="text-gray-800 flex-1">
            {order.deliveryType === 'delivery' ? '快递' : '自提'}
          </Text>
        </View>
        {order.address && (
          <View className="flex-row mt-2">
            <Text className="text-gray-500 w-20">地址</Text>
            <Text className="text-gray-800 flex-1">{order.address}</Text>
          </View>
        )}
      </View>

      <View className="bg-white mt-2 p-4 flex-row">
        <View className="w-16 h-16 bg-gray-100 rounded mr-3 overflow-hidden items-center justify-center">
          {/* 这里实际应显示图片，简化兼容处理 */}
          <Text className="text-2xl">📦</Text>
        </View>
        <View className="flex-1 justify-center">
          <Text className="text-gray-800 font-medium">{order.item.title}</Text>
          <Text className="text-red-500 mt-1">¥{order.amount}</Text>
        </View>
      </View>

      {/* 操作按钮 */}
      <View className="mt-6 px-4">
        {order.status === 'pending' && isBuyer && (
          <TouchableOpacity
            className="bg-primary-500 py-3 rounded-full mb-3"
            onPress={() => updateStatusMutation.mutate('pay')}
          >
            <Text className="text-white text-center font-bold">立即支付 (模拟)</Text>
          </TouchableOpacity>
        )}

        {order.status === 'paid' && isSeller && (
          <TouchableOpacity
            className="bg-primary-500 py-3 rounded-full mb-3"
            onPress={() => updateStatusMutation.mutate('ship')}
          >
            <Text className="text-white text-center font-bold">确认发货</Text>
          </TouchableOpacity>
        )}

        {order.status === 'shipping' && isBuyer && (
          <TouchableOpacity
            className="bg-primary-500 py-3 rounded-full mb-3"
            onPress={() => updateStatusMutation.mutate('confirm')}
          >
            <Text className="text-white text-center font-bold">确认收货</Text>
          </TouchableOpacity>
        )}

        {(order.status === 'pending' || (order.status === 'paid' && isSeller)) && (
          <TouchableOpacity
            className="bg-white border border-gray-300 py-3 rounded-full"
            onPress={() => updateStatusMutation.mutate('cancel')}
          >
            <Text className="text-gray-600 text-center">取消订单</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
