import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Habit } from '@/db/types';
import { radius, spacing, useTheme } from '@/theme';

export function HabitCheckRow({
  habit,
  checked,
  onToggle,
}: {
  habit: Habit;
  checked: boolean;
  onToggle: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: habit.color,
            backgroundColor: checked ? habit.color : 'transparent',
          },
        ]}
      >
        {checked ? <Text style={styles.check}>✓</Text> : null}
      </View>
      <Text style={styles.emoji}>{habit.emoji}</Text>
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
      {habit.reminderTime ? (
        <Text style={[styles.time, { color: colors.textMuted }]}>{habit.reminderTime}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  emoji: { fontSize: 18 },
  name: { flex: 1, fontSize: 16 },
  time: { fontSize: 12, fontVariant: ['tabular-nums'] },
});
