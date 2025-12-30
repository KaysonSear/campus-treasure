import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Message } from '@/types';
import { useAuthStore } from '@/store';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // Other user ID
  const [content, setContent] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const user = useAuthStore((state) => state.user);

  // 获取消息记录
  const { data: messagesData, refetch } = useQuery({
    queryKey: ['messages', id],
    queryFn: async () => {
      const response = await api.get<{ messages: Message[] }>(`/messages?with=${id}`);
      return response.messages;
    },
  });

  const handleSend = async () => {
    if (!content.trim() || !user) return;

    try {
      // 发送消息到后端
      await api.post('/messages', {
        receiverId: id,
        content: content.trim(),
        type: 'text',
      });

      // 清空输入框
      setContent('');

      // 刷新消息列表
      refetch();

      // 滚动到底部
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      console.error('发送消息失败:', error);
      Alert.alert('错误', '消息发送失败，请重试');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.id;

    return (
      <View className={`flex-row ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
        <View
          className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-blue-500' : 'bg-gray-200'}`}
        >
          <Text className={`${isMe ? 'text-white' : 'text-gray-800'} text-sm`}>{item.content}</Text>
          <Text className={`${isMe ? 'text-blue-100' : 'text-gray-500'} text-xs mt-1`}>
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-500 text-lg">← 返回</Text>
        </TouchableOpacity>
        <Text className="font-semibold text-lg">聊天</Text>
        <View className="w-16" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <FlatList
          ref={flatListRef}
          data={messagesData || []}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          className="flex-1 px-4"
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
        />

        <View className="flex-row items-center p-4 border-t border-gray-200">
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="输入消息..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!content.trim()}
            className={`rounded-full p-2 ${content.trim() ? 'bg-blue-500' : 'bg-gray-300'}`}
          >
            <Text className="text-white font-semibold">发送</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
