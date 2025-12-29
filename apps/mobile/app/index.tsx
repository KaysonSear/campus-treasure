import { Redirect } from 'expo-router';

export default function Index() {
  // 默认重定向到tabs首页
  return <Redirect href="/(tabs)" />;
}
