import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Habit } from '@/db/types';
import { radius, spacing, useTheme } from '@/theme';

export function HabitCheckRow({
  habit,
  checked,
  onToggle,
  onLongPress,
}: {
  habit: Habit;
  checked: boolean;
  onToggle: () => void;
  onLongPress?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      onLongPress={onLongPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View
        style={[
          styles.swatch,
          {
            backgroundColor: checked ? habit.color : `${habit.color}26`,
          },
        ]}
      >
        {checked ? <Text style={styles.check}>✓</Text> : null}
      </View>
      <Text
        numberOfLines={1}
        style={[
          styles.name,
          {
            color: checked ? colors.textMuted : colors.text,
            textDecorationLine: checked ? 'line-through' : 'none',
          },
        ]}
      >
        {habit.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  name: { flex: 1, fontSize: 16, fontWeight: '500' },
});
