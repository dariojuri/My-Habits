import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/theme';

export default function RootLayout() {
  const { dark } = useTheme();
  const init = useAppStore((s) => s.init);

  useEffect(() => {
    void init();
  }, [init]);

  return (
    <SafeAreaProvider>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
