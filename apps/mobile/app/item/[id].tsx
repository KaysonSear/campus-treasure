import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store';
import { api } from '@/lib';
import { Item } from '@/types';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isFavorite, setIsFavorite] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    data: item,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['item', id],
    queryFn: () => api.get<Item>(`/items/${id}`),
    enabled: !!id,
  });

  useEffect(() => {
    if (item?.isFavorite !== undefined) {
      setIsFavorite(item.isFavorite);
    }
  }, [item?.isFavorite]);

  // Mutation for toggling favorite
  const favoriteMutation = useMutation({
    mutationFn: () => api.post(`/items/${id}/favorite`),
    onSuccess: (data: any) => {
      // Optimistic update or refetch
      // data.data.isFavorite is the new state
      setIsFavorite(data.isFavorite);
    },
    onError: (error: Error) => {
      // Revert state if needed, here just alert
      Alert.alert('操作失败', error.message);
      setIsFavorite(!isFavorite); // Revert UI
    },
  });

  // Sync state with item data when loaded
  if (item && item.isFavorite !== undefined && !favoriteMutation.isPending) {
    // Only sync if we haven't manually toggled recently (simplification)
    // Better approach: use useEffect to sync once
  }

  // Use effect to sync initial state
  useState(() => {
    if (item?.isFavorite !== undefined) {
      setIsFavorite(item.isFavorite);
    }
  });

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      Alert.alert('提示', '请先登录', [
        { text: '取消' },
        { text: '去登录', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    // Optimistic UI update
    setIsFavorite(!isFavorite);
    favoriteMutation.mutate();
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      Alert.alert('提示', '请先登录', [
        { text: '取消' },
        { text: '去登录', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    router.push(`/message/${item?.seller.id}`);
  };

  const handleBuy = () => {
    if (!isAuthenticated) {
      Alert.alert('提示', '请先登录', [
        { text: '取消' },
        { text: '去登录', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    // 如果是自己发布的物品
    if (item?.seller.id === useAuthStore.getState().user?.id) {
      Alert.alert('提示', '不能购买自己发布的物品');
      return;
    }

    // 跳转到下单确认页
    router.push({
      pathname: '/order/create',
      params: { itemId: id },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500 mb-4">物品加载失败或不存在</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="px-6 py-2 bg-gray-100 rounded-full"
        >
          <Text>返回</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 顶部导航 */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-medium">物品详情</Text>
        <TouchableOpacity onPress={handleToggleFavorite}>
          <Text className="text-2xl">{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* 图片区域 */}
        <View className="h-80 bg-gray-100 items-center justify-center">
          {item.images[0]?.startsWith('http') ? (
            <Image
              source={{ uri: item.images[0] }}
              className="w-full h-full"
              resizeMode="contain"
            />
          ) : (
            <Text className="text-8xl">{item.images[0] || '📦'}</Text>
          )}
        </View>

        {/* 价格和标题 */}
        <View className="px-4 py-4">
          <View className="flex-row items-baseline">
            <Text className="text-red-500 text-3xl font-bold">¥{item.price}</Text>
          </View>
          <Text className="text-lg text-gray-800 mt-2 font-medium">{item.title}</Text>
          <View className="flex-row mt-2 space-x-2">
            <Text className="bg-primary-100 text-primary-600 px-2 py-1 rounded text-xs">
              {item.condition}
            </Text>
            <Text className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs ml-2">
              {item.category}
            </Text>
          </View>
        </View>

        {/* 卖家信息 */}
        <View className="bg-gray-50 mx-4 p-4 rounded-xl flex-row items-center">
          <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center overflow-hidden">
            {item.seller.avatar ? (
              <Image source={{ uri: item.seller.avatar }} className="w-full h-full" />
            ) : (
              <Text className="text-xl text-primary-500">{item.seller.nickname[0]}</Text>
            )}
          </View>
          <View className="ml-3 flex-1">
            <Text className="font-medium text-gray-800">{item.seller.nickname}</Text>
            <Text className="text-gray-500 text-sm">信誉良好</Text>
          </View>
          {/* School info might not be available in item.seller from list api but is in detail api */}
          <Text className="text-gray-400 text-sm">已认证</Text>
        </View>

        {/* 物品描述 */}
        <View className="px-4 py-4">
          <Text className="text-gray-800 font-medium mb-2">物品描述</Text>
          <Text className="text-gray-600 leading-6">
            {item.status === 'available' ? '🔥 ' : ''}
            {item.description}
          </Text>
        </View>

        {/* 浏览量等信息 */}
        <View className="px-4 py-2 flex-row pb-8">
          <Text className="text-gray-400 text-sm">
            📅 发布于 {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* 底部操作栏 */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex-row">
        <TouchableOpacity
          className="flex-1 items-center justify-center border border-primary-500 rounded-xl py-3 mr-2"
          onPress={handleContact}
        >
          <Text className="text-primary-500 font-medium">💬 联系卖家</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 items-center justify-center rounded-xl py-3 ml-2 ${
            item.status === 'available' ? 'bg-primary-500' : 'bg-gray-300'
          }`}
          onPress={handleBuy}
          disabled={item.status !== 'available'}
        >
          <Text className="text-white font-medium">
            {item.status === 'available' ? '立即购买' : '已售出'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
