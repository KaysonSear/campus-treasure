import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib';
import { Order } from '@/types';

const STATUS_MAP: Record<string, string> = {
  pending: '待支付',
  paid: '待发货',
  shipping: '待收货',
  completed: '已完成',
  cancelled: '已取消',
};

export default function OrderListScreen() {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');

  const {
    data: orders,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['orders', activeTab],
    queryFn: () => api.get<Order[]>(`/orders`, { params: { type: activeTab } }),
  });

  const renderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      className="bg-white p-4 mb-2"
      onPress={() => router.push(`/order/${item.id}`)}
    >
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-500 text-xs">订单号: {item.orderNo}</Text>
        <Text className="text-primary-500 font-medium text-xs">{STATUS_MAP[item.status]}</Text>
      </View>

      <View className="flex-row">
        <View className="w-20 h-20 bg-gray-100 rounded mr-3 overflow-hidden items-center justify-center">
          {item.item.images?.[0]?.startsWith('http') ? (
            <Image source={{ uri: item.item.images[0] }} className="w-full h-full" />
          ) : (
            <Text className="text-2xl">📦</Text>
          )}
        </View>
        <View className="flex-1 justify-between">
          <Text className="text-gray-800 font-medium" numberOfLines={2}>
            {item.item.title}
          </Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-red-500 font-bold">¥{item.amount}</Text>
          </View>
        </View>
      </View>

      <View className="mt-2 pt-2 border-t border-gray-50 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <View className="w-5 h-5 bg-gray-200 rounded-full mr-2 items-center justify-center">
            <Text className="text-[10px]">
              {activeTab === 'buy' ? item.seller.nickname[0] : item.buyer.nickname[0]}
            </Text>
          </View>
          <Text className="text-gray-500 text-xs">
            {activeTab === 'buy' ? `卖家: ${item.seller.nickname}` : `买家: ${item.buyer.nickname}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 顶部导航 */}
      <View className="bg-white px-4 py-3 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-medium">我的订单</Text>
        <View className="w-5" />
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white mb-2">
        <TouchableOpacity
          className={`flex-1 py-3 border-b-2 ${activeTab === 'buy' ? 'border-primary-500' : 'border-transparent'}`}
          onPress={() => setActiveTab('buy')}
        >
          <Text
            className={`text-center ${activeTab === 'buy' ? 'text-primary-500 font-bold' : 'text-gray-500'}`}
          >
            我买到的
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 border-b-2 ${activeTab === 'sell' ? 'border-primary-500' : 'border-transparent'}`}
          onPress={() => setActiveTab('sell')}
        >
          <Text
            className={`text-center ${activeTab === 'sell' ? 'text-primary-500 font-bold' : 'text-gray-500'}`}
          >
            我卖出的
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View className="items-center justify-center py-10">
              <Text className="text-gray-400">暂无订单</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
