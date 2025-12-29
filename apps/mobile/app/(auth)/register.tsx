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
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { api } from '@/lib';

export default function RegisterScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!phone || !password || !nickname) {
      Alert.alert('提示', '请填写完整信息');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }

    if (password.length < 6) {
      Alert.alert('提示', '密码至少6位');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('提示', '两次密码输入不一致');
      return;
    }

    if (nickname.length < 2 || nickname.length > 20) {
      Alert.alert('提示', '昵称需要2-20个字符');
      return;
    }

    setLoading(true);
    try {
      await api.post('/users/register', { phone, password, nickname });
      Alert.alert('注册成功', '请登录', [
        { text: '好的', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (error) {
      Alert.alert('注册失败', error instanceof Error ? error.message : '请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow justify-center px-8 py-12"
      >
        {/* Logo */}
        <View className="items-center mb-10">
          <Text className="text-4xl font-bold text-primary-500">注册账号</Text>
          <Text className="text-gray-500 mt-2">加入校园宝，开启交易之旅</Text>
        </View>

        {/* 表单 */}
        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 mb-2 font-medium">昵称</Text>
            <TextInput
              className="bg-gray-100 px-4 py-3 rounded-xl text-base"
              placeholder="2-20个字符"
              value={nickname}
              onChangeText={setNickname}
              maxLength={20}
            />
          </View>

          <View className="mt-4">
            <Text className="text-gray-700 mb-2 font-medium">手机号</Text>
            <TextInput
              className="bg-gray-100 px-4 py-3 rounded-xl text-base"
              placeholder="请输入手机号"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={11}
            />
          </View>

          <View className="mt-4">
            <Text className="text-gray-700 mb-2 font-medium">密码</Text>
            <TextInput
              className="bg-gray-100 px-4 py-3 rounded-xl text-base"
              placeholder="至少6位"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View className="mt-4">
            <Text className="text-gray-700 mb-2 font-medium">确认密码</Text>
            <TextInput
              className="bg-gray-100 px-4 py-3 rounded-xl text-base"
              placeholder="再次输入密码"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            className={`mt-6 py-4 rounded-xl ${loading ? 'bg-primary-300' : 'bg-primary-500'}`}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold text-lg">注册</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 底部链接 */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-gray-500">已有账号？</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="text-primary-500 font-medium">立即登录</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
