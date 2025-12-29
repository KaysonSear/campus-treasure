import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store';

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">👤</Text>
          <Text className="text-xl text-gray-600 mb-2">未登录</Text>
          <Text className="text-gray-400 text-center mb-8">登录后查看个人信息</Text>
          <TouchableOpacity
            className="bg-primary-500 px-8 py-3 rounded-full"
            onPress={() => router.push('/(auth)/login')}
          >
            <Text className="text-white font-semibold">去登录</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* 用户信息 */}
        <View className="bg-white px-4 py-6">
          <View className="flex-row items-center">
            <View className="w-16 h-16 bg-primary-100 rounded-full items-center justify-center">
              <Text className="text-3xl">👤</Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold text-gray-800">{user?.nickname}</Text>
              <Text className="text-gray-500 mt-1">
                {user?.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
              </Text>
            </View>
          </View>
        </View>

        {/* 菜单项 */}
        <View className="bg-white mt-2">
          {[
            { icon: '📦', title: '我发布的', desc: '查看我发布的物品' },
            { icon: '❤️', title: '我的收藏', desc: '收藏的宝贝' },
            { icon: '📋', title: '我的订单', desc: '买入/卖出记录' },
            { icon: '⭐', title: '信用评价', desc: '我的信用分' },
            { icon: '⚙️', title: '设置', desc: '账号与安全' },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row items-center px-4 py-4 border-b border-gray-100"
            >
              <Text className="text-2xl mr-4">{item.icon}</Text>
              <View className="flex-1">
                <Text className="text-gray-800 font-medium">{item.title}</Text>
                <Text className="text-gray-400 text-sm">{item.desc}</Text>
              </View>
              <Text className="text-gray-300">›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 退出登录 */}
        <TouchableOpacity className="bg-white mt-4 py-4" onPress={handleLogout}>
          <Text className="text-red-500 text-center font-medium">退出登录</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
