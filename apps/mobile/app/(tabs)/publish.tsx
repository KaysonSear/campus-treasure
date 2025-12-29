import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store';

export default function PublishScreen() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handlePublish = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    // TODO: 跳转到发布页面
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-5xl mb-4">📦</Text>
        <Text className="text-xl text-gray-600 mb-2">发布物品</Text>
        <Text className="text-gray-400 text-center mb-8">
          {isAuthenticated ? '分享你的闲置物品' : '登录后即可发布物品'}
        </Text>
        <TouchableOpacity className="bg-primary-500 px-8 py-3 rounded-full" onPress={handlePublish}>
          <Text className="text-white font-semibold">
            {isAuthenticated ? '立即发布' : '去登录'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
