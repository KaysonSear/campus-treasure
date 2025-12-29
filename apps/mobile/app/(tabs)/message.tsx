import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MessageScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 items-center justify-center">
        <Text className="text-5xl mb-4">💬</Text>
        <Text className="text-xl text-gray-600">消息</Text>
        <Text className="text-gray-400 mt-2">暂无新消息</Text>
      </View>
    </SafeAreaView>
  );
}
