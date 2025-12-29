import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryProvider } from '@/lib/query';

export default function RootLayout() {
  return (
    <QueryProvider>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </QueryProvider>
  );
}
