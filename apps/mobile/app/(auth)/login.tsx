import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuthStore } from '@/store';
import { api } from '@/lib';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('提示', '请输入手机号和密码');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }

    setLoading(true);
    try {
      const data = await api.post<{
        user: {
          id: string;
          phone: string;
          nickname: string;
          avatar?: string;
          isVerified: boolean;
        };
        token: string;
      }>('/users/login', { phone, password });

      login(data.user, data.token);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('登录失败', error instanceof Error ? error.message : '请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center px-8">
        {/* Logo */}
        <View className="items-center mb-12">
          <Text className="text-4xl font-bold text-primary-500">校园宝</Text>
          <Text className="text-gray-500 mt-2">校园二手交易平台</Text>
        </View>

        {/* 表单 */}
        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 mb-2 font-medium">手机号</Text>
            <TextInput
              className="bg-gray-100 px-4 py-3 rounded-xl text-base"
              placeholder="请输入手机号"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={11}
              autoCapitalize="none"
            />
          </View>

          <View className="mt-4">
            <Text className="text-gray-700 mb-2 font-medium">密码</Text>
            <TextInput
              className="bg-gray-100 px-4 py-3 rounded-xl text-base"
              placeholder="请输入密码"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            className={`mt-6 py-4 rounded-xl ${loading ? 'bg-primary-300' : 'bg-primary-500'}`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold text-lg">登录</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 底部链接 */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-gray-500">还没有账号？</Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text className="text-primary-500 font-medium">立即注册</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
