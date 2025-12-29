import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib';
import { Item } from '@/types';
import { useAuthStore } from '@/store';

export default function CreateOrderScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState('');
  const [contactPhone, setContactPhone] = useState(useAuthStore.getState().user?.phone || '');
  const [remark, setRemark] = useState('');

  const { data: item, isLoading } = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => api.get<Item>(`/items/${itemId}`),
    enabled: !!itemId,
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: unknown) => api.post('/orders', data),
    onSuccess: (data: any) => {
      // data.data is Order object because api.post returns json.data
      const orderId = data.id;
      Alert.alert('下单成功', '请尽快支付', [
        { text: '查看订单', onPress: () => router.replace(`/order/${orderId}`) },
      ]);
    },
    onError: (error: Error) => {
      Alert.alert('下单失败', error.message);
    },
  });

  const handleSubmit = () => {
    if (!contactPhone) {
      Alert.alert('提示', '请填写联系电话');
      return;
    }
    if (deliveryType === 'delivery' && !address) {
      Alert.alert('提示', '请填写收货地址');
      return;
    }

    createOrderMutation.mutate({
      itemId,
      deliveryType,
      address,
      contactPhone,
      remark,
    });
  };

  if (isLoading || !item) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text>加载中...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-3 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-medium">确认订单</Text>
        <View className="w-5" />
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* 商品信息 */}
        <View className="bg-white rounded-xl p-4 mb-4 flex-row">
          <View className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden mr-3 items-center justify-center">
            {item.images[0]?.startsWith('http') ? (
              <Image source={{ uri: item.images[0] }} className="w-full h-full" />
            ) : (
              <Text className="text-3xl">📦</Text>
            )}
          </View>
          <View className="flex-1 justify-between">
            <Text className="text-gray-800 font-medium" numberOfLines={2}>
              {item.title}
            </Text>
            <Text className="text-red-500 font-bold text-lg">¥{item.price}</Text>
          </View>
        </View>

        {/* 配送方式 */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-gray-800 font-medium mb-3">配送方式</Text>
          <View className="flex-row space-x-4">
            <TouchableOpacity
              className={`flex-1 py-2 rounded-lg items-center border ${
                deliveryType === 'delivery'
                  ? 'bg-primary-50 border-primary-500'
                  : 'bg-white border-gray-200'
              }`}
              onPress={() => setDeliveryType('delivery')}
            >
              <Text className={deliveryType === 'delivery' ? 'text-primary-500' : 'text-gray-600'}>
                快递配送
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-2 rounded-lg items-center border ${
                deliveryType === 'pickup'
                  ? 'bg-primary-50 border-primary-500'
                  : 'bg-white border-gray-200'
              }`}
              onPress={() => setDeliveryType('pickup')}
            >
              <Text className={deliveryType === 'pickup' ? 'text-primary-500' : 'text-gray-600'}>
                自提
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 地址/联系方式 */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <View className="mb-3">
            <Text className="text-gray-800 font-medium mb-2">联系电话</Text>
            <TextInput
              className="bg-gray-50 px-3 py-2 rounded-lg"
              value={contactPhone}
              onChangeText={setContactPhone}
              placeholder="请输入手机号"
              keyboardType="phone-pad"
            />
          </View>

          {deliveryType === 'delivery' && (
            <View>
              <Text className="text-gray-800 font-medium mb-2">收货地址</Text>
              <TextInput
                className="bg-gray-50 px-3 py-2 rounded-lg h-20"
                value={address}
                onChangeText={setAddress}
                placeholder="宿舍楼栋/门牌号等"
                multiline
                textAlignVertical="top"
              />
            </View>
          )}

          {deliveryType === 'pickup' && (
            <Text className="text-gray-500 text-sm">自提地点请联系卖家确认</Text>
          )}
        </View>

        {/* 备注 */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-gray-800 font-medium mb-2">备注</Text>
          <TextInput
            className="bg-gray-50 px-3 py-2 rounded-lg"
            value={remark}
            onChangeText={setRemark}
            placeholder="选填：对卖家的留言"
          />
        </View>
      </ScrollView>

      {/* 底部结算栏 */}
      <View className="bg-white px-4 py-3 border-t border-gray-100 flex-row items-center justify-between">
        <View className="flex-row items-baseline">
          <Text className="text-gray-600 mr-1">合计:</Text>
          <Text className="text-red-500 text-xl font-bold">¥{item.price}</Text>
        </View>
        <TouchableOpacity
          className="bg-primary-500 px-8 py-3 rounded-full"
          onPress={handleSubmit}
          disabled={createOrderMutation.isPending}
        >
          <Text className="text-white font-medium">
            {createOrderMutation.isPending ? '提交中...' : '提交订单'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
