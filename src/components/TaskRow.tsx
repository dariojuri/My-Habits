import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Task } from '@/db/types';
import { radius, spacing, useTheme } from '@/theme';

export function TaskRow({
  task,
  onComplete,
  onDelete,
}: {
  task: Task;
  onComplete: () => void;
  onDelete: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onComplete}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: false }}
        style={({ pressed }) => [styles.tap, { opacity: pressed ? 0.6 : 1 }]}
      >
        <View style={[styles.checkbox, { borderColor: colors.textMuted }]} />
        <Text style={[styles.text, { color: colors.text }]}>{task.text}</Text>
      </Pressable>
      <Pressable onPress={onDelete} hitSlop={8} accessibilityLabel="Rimuovi impegno">
        <Text style={{ color: colors.textMuted, fontSize: 15 }}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  tap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  checkbox: { width: 20, height: 20, borderRadius: radius.sm, borderWidth: 2 },
  text: { flex: 1, fontSize: 15 },
});
