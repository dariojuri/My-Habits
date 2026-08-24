import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { TaskOccurrence } from '@/db/types';
import { radius, spacing, useTheme } from '@/theme';

export function TaskRow({
  task,
  onComplete,
  onPress,
}: {
  task: TaskOccurrence;
  onComplete: () => void;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Pressable
        onPress={onComplete}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: false }}
      >
        <View style={[styles.checkbox, { borderColor: colors.primary }]} />
      </Pressable>
      <Text style={[styles.text, { color: colors.text }]} numberOfLines={2}>
        {task.isRecurring ? '🔁 ' : ''}
        {task.text}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  checkbox: { width: 20, height: 20, borderRadius: radius.sm, borderWidth: 2 },
  text: { flex: 1, fontSize: 15 },
});
