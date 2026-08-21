import { useCallback, useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
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

/** Giorni visibili senza scroll: il grafico resta leggibile, il resto del mese si scopre scorrendo. */
const VISIBLE_DAYS = 5;

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

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const chartData = days.map((day) => ({
    value: counts[day] ?? 0,
    label: formatDayNumber(day),
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

  /** Cap del grafico al numero di abitudini inserite: ogni sezione = 1 unità, niente decimali. */
  const chartMax = Math.max(habits.length, 1);
  /** Finestra visibile di VISIBLE_DAYS giorni; il resto del mese si scopre scorrendo. */
  const viewportWidth = Dimensions.get('window').width - spacing.lg * 2 - spacing.xl * 2;
  const daySpacing = viewportWidth / VISIBLE_DAYS;
  const chartWidth = daySpacing * (days.length - 1);

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
          <View style={{ width: viewportWidth, overflow: 'hidden' }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={daySpacing}
              decelerationRate="fast"
            >
              <LineChart
                data={chartData}
                width={chartWidth}
                height={130}
                spacing={daySpacing}
                initialSpacing={daySpacing / 2}
                endSpacing={daySpacing / 2}
                thickness={2.5}
                color={colors.text}
                dataPointsColor={colors.text}
                dataPointsRadius={3}
                areaChart
                startFillColor={colors.text}
                endFillColor={colors.text}
                startOpacity={0.16}
                endOpacity={0}
                hideRules={false}
                rulesColor={colors.border}
                yAxisColor="transparent"
                xAxisColor={colors.border}
                yAxisTextStyle={{ color: colors.textMuted, fontSize: 9 }}
                xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 9 }}
                maxValue={chartMax}
                noOfSections={chartMax}
                formatYLabel={(label) => String(Math.round(Number(label)))}
                curved
              />
            </ScrollView>
          </View>
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
                    { backgroundColor: active ? habit.color : colors.surfaceAlt },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? '#FFFFFF' : colors.text,
                      fontSize: 12,
                      fontWeight: '600',
                    }}
                  >
                    {habit.name}
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
                  ? colors.text
                  : (habits.find((h) => h.id === selectedHabitId)?.color ?? colors.text);
              return (
                <View
                  key={day}
                  style={[styles.cell, { backgroundColor: done ? tint : colors.surfaceAlt }]}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '600',
                      color: done ? colors.primaryText : colors.textMuted,
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
  month: { fontSize: 20, fontWeight: '800', textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg, paddingHorizontal: 4 },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 11, textAlign: 'center', marginTop: 2 },
  chips: { marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    marginRight: spacing.sm,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
