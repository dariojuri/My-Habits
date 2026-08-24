import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useTheme } from '@/theme';

function icon(glyph: string) {
  return function TabIcon({ color }: { color: string }) {
    return <Text style={{ fontSize: 18, color }}>{glyph}</Text>;
  };
}

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Oggi', tabBarIcon: icon('🗓️') }} />
      <Tabs.Screen name="habits" options={{ title: 'Abitudini', tabBarIcon: icon('✅') }} />
      <Tabs.Screen name="andamento" options={{ title: 'Andamento', tabBarIcon: icon('📈') }} />
    </Tabs>
  );
}
