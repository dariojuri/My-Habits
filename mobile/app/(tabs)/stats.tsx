import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-gifted-charts';
import { Card, IconButton, SectionTitle } from '@/components/ui';
import { getAllCompletedDates, getCompletedDatesForHabit, getDailyCounts } from '@/db/logs';
import type { DateKey } from '@/lib/date';
import {
  formatDayNumber,
  formatMonthTitle,
  monthDays,
  shiftMonth,
  todayKey,
} from '@/lib/date';
import { bestStreak, currentStreak } from '@/lib/stats';
import { habitPlannedOn, useAppStore } from '@/store/useAppStore';
import { radius, spacing, useTheme } from '@/theme';

export default function StatsScreen() {
  const { colors } = useTheme();
  const habits = useAppStore((s) => s.habits);
  const [monthAnchor, setMonthAnchor] = useState<DateKey>(todayKey());
  const [counts, setCounts] = useState<Record<DateKey, number>>({});
  const [allDates, setAllDates] = useState<DateKey[]>([]);
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
  const [habitDates, setHabitDates] = useState<Set<DateKey>>(new Set());

  const days = useMemo(() => monthDays(monthAnchor), [monthAnchor]);
  const from = days[0];
  const to = days[days.length - 1];

  const load = useCallback(async () => {
    const [daily, all] = await Promise.all([getDailyCounts(from, to), getAllCompletedDates()]);
    const map: Record<DateKey, number> = {};
    for (const row of daily) map[row.date] = row.completed;
    setCounts(map);
    setAllDates(all);
    if (selectedHabitId !== null) {
      setHabitDates(await getCompletedDatesForHabit(selectedHabitId, from, to));
    } else {
      setHabitDates(new Set());
    }
  }, [from, to, selectedHabitId]);

  useEffect(() => {
    void load();
  }, [load, habits]);

  const chartData = days.map((day) => ({
    value: counts[day] ?? 0,
    label: Number(formatDayNumber(day)) % 5 === 0 ? formatDayNumber(day) : '',
  }));

  const plannedTotal = days.reduce(
    (sum, day) => sum + habits.filter((h) => habitPlannedOn(h, day)).length,
    0,
  );
  const completedTotal = days.reduce((sum, day) => sum + (counts[day] ?? 0), 0);
  const percent = plannedTotal === 0 ? 0 : Math.round((completedTotal / plannedTotal) * 100);

  const dateSet = useMemo(() => new Set(allDates), [allDates]);
  const streak = currentStreak(dateSet);
  const best = bestStreak(allDates);

  const chartWidth = Dimensions.get('window').width - spacing.lg * 2 - spacing.lg * 2;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <IconButton
            label="‹"
            accessibilityLabel="Mese precedente"
            onPress={() => setMonthAnchor(shiftMonth(monthAnchor, -1))}
          />
          <Text style={[styles.month, { color: colors.text }]}>
            {formatMonthTitle(monthAnchor)}
          </Text>
          <IconButton
            label="›"
            accessibilityLabel="Mese successivo"
            onPress={() => setMonthAnchor(shiftMonth(monthAnchor, 1))}
          />
        </View>

        <Card>
          <SectionTitle>Completate per giorno</SectionTitle>
          <LineChart
            data={chartData}
            width={chartWidth}
            height={180}
            spacing={Math.max(10, chartWidth / days.length)}
            initialSpacing={8}
            thickness={2}
            color={colors.primary}
            dataPointsColor={colors.primary}
            dataPointsRadius={3}
            hideRules={false}
            rulesColor={colors.border}
            yAxisColor={colors.border}
            xAxisColor={colors.border}
            yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 10 }}
            noOfSections={4}
            curved
          />
        </Card>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.text }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Streak corrente</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.text }]}>{best}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Miglior streak</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.text }]}>{percent}%</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Mese completato</Text>
          </Card>
        </View>

        <Card>
          <SectionTitle>Calendario per abitudine</SectionTitle>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
            {habits.map((habit) => {
              const active = selectedHabitId === habit.id;
              return (
                <Pressable
                  key={habit.id}
                  onPress={() => setSelectedHabitId(active ? null : habit.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? habit.color : colors.surfaceAlt,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: active ? '#FFFFFF' : colors.text, fontSize: 12 }}>
                    {habit.emoji} {habit.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.grid}>
            {days.map((day) => {
              const done =
                selectedHabitId === null ? (counts[day] ?? 0) > 0 : habitDates.has(day);
              const tint =
                selectedHabitId === null
                  ? colors.primary
                  : (habits.find((h) => h.id === selectedHabitId)?.color ?? colors.primary);
              return (
                <View
                  key={day}
                  style={[
                    styles.cell,
                    {
                      backgroundColor: done ? tint : colors.surfaceAlt,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      color: done ? '#FFFFFF' : colors.textMuted,
                    }}
                  >
                    {formatDayNumber(day)}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  month: { fontSize: 18, fontWeight: '700', textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg, paddingHorizontal: 4 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, textAlign: 'center', marginTop: 2 },
  chips: { marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: spacing.sm,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  cell: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
