import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DateKey } from '@/lib/date';
import { formatDayNumber } from '@/lib/date';
import { radius, useTheme } from '@/theme';

export function HeatmapGrid({
  days,
  cellColor,
  cellLabel,
  cellTextColor,
  onPressDay,
}: {
  days: DateKey[];
  cellColor: (day: DateKey) => string;
  cellLabel?: (day: DateKey) => string;
  cellTextColor?: (day: DateKey) => string;
  onPressDay?: (day: DateKey) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.grid}>
      {days.map((day) => (
        <Pressable
          key={day}
          onPress={() => onPressDay?.(day)}
          style={[styles.cell, { backgroundColor: cellColor(day) }]}
        >
          <Text style={{ fontSize: 12, color: cellTextColor?.(day) ?? colors.textMuted }}>
            {cellLabel ? cellLabel(day) : formatDayNumber(day)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
