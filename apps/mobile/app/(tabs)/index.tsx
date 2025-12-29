import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

// 分类数据
const categories = [
  { id: '1', name: '电子数码', icon: '📱' },
  { id: '2', name: '图书教材', icon: '📚' },
  { id: '3', name: '服饰鞋包', icon: '👕' },
  { id: '4', name: '生活用品', icon: '🏠' },
  { id: '5', name: '运动户外', icon: '⚽' },
  { id: '6', name: '美妆护肤', icon: '💄' },
  { id: '7', name: '租赁服务', icon: '🔑' },
  { id: '8', name: '更多', icon: '➕' },
];

// 模拟物品数据
const mockItems = [
  { id: '1', title: '二手MacBook Pro 2021', price: 6999, image: '💻', condition: '9成新' },
  { id: '2', title: '高等数学同济版', price: 25, image: '📖', condition: '8成新' },
  { id: '3', title: '耐克运动鞋 42码', price: 199, image: '👟', condition: '9成新' },
  { id: '4', title: '小米台灯', price: 49, image: '💡', condition: '全新' },
];

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* 顶部搜索栏 */}
        <View className="bg-white px-4 py-3">
          <TouchableOpacity className="bg-gray-100 rounded-full px-4 py-3 flex-row items-center">
            <Text className="text-gray-400 flex-1">搜索你想要的宝贝</Text>
            <Text>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* 分类网格 */}
        <View className="bg-white mt-2 px-4 py-4">
          <View className="flex-row flex-wrap">
            {categories.map((cat) => (
              <TouchableOpacity key={cat.id} className="w-1/4 items-center py-3">
                <Text className="text-3xl mb-1">{cat.icon}</Text>
                <Text className="text-gray-700 text-sm">{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 推荐物品 */}
        <View className="mt-2 px-4">
          <Text className="text-lg font-bold text-gray-800 py-3">推荐好物</Text>
          <View className="flex-row flex-wrap -mx-1">
            {mockItems.map((item) => (
              <TouchableOpacity key={item.id} className="w-1/2 p-1">
                <View className="bg-white rounded-xl p-3">
                  <View className="h-32 bg-gray-100 rounded-lg items-center justify-center">
                    <Text className="text-5xl">{item.image}</Text>
                  </View>
                  <Text className="mt-2 text-gray-800 font-medium" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View className="flex-row items-center justify-between mt-1">
                    <Text className="text-primary-500 font-bold">¥{item.price}</Text>
                    <Text className="text-gray-400 text-xs">{item.condition}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
