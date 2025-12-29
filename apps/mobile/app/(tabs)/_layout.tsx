import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';

// 简单的Tab图标组件
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    home: '🏠',
    search: '🔍',
    publish: '➕',
    message: '💬',
    profile: '👤',
  };

  return (
    <View className="items-center">
      <Text className="text-2xl">{icons[name] || '●'}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: '发现',
          tabBarIcon: ({ focused }) => <TabIcon name="search" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="publish"
        options={{
          title: '发布',
          tabBarIcon: ({ focused }) => <TabIcon name="publish" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          title: '消息',
          tabBarIcon: ({ focused }) => <TabIcon name="message" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
