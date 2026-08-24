import { useEffect, useMemo, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { TaskOccurrence } from '@/db/types';
import { isToday, type DateKey } from '@/lib/date';
import { radius, spacing, useTheme } from '@/theme';
import { TaskRow } from './TaskRow';
import { EmptyState, SectionTitle } from './ui';

const ROW_HEIGHT = 64;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function DayTimeline({
  date,
  tasks,
  onToggle,
  onPressTask,
  onPressHour,
}: {
  date: DateKey;
  tasks: TaskOccurrence[];
  onToggle: (task: TaskOccurrence) => void;
  onPressTask: (taskId: number) => void;
  onPressHour: (hour: number) => void;
}) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  const { unscheduled, byHour } = useMemo(() => {
    const unscheduled: TaskOccurrence[] = [];
    const byHour = new Map<number, TaskOccurrence[]>();
    for (const task of tasks) {
      if (!task.time) {
        unscheduled.push(task);
        continue;
      }
      const hour = Number(task.time.split(':')[0]);
      const list = byHour.get(hour) ?? [];
      list.push(task);
      byHour.set(hour, list);
    }
    for (const list of byHour.values()) {
      list.sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''));
    }
    return { unscheduled, byHour };
  }, [tasks]);

  useEffect(() => {
    const targetHour = isToday(date) ? new Date().getHours() : 8;
    const offset = Math.max(0, (targetHour - 1) * ROW_HEIGHT);
    const id = setTimeout(() => scrollRef.current?.scrollTo({ y: offset, animated: false }), 50);
    return () => clearTimeout(id);
  }, [date]);

  return (
    <View>
      {unscheduled.length > 0 ? (
        <View style={styles.unscheduled}>
          <SectionTitle>Senza orario</SectionTitle>
          {unscheduled.map((task) => (
            <TaskRow
              key={task.taskId}
              task={task}
              onComplete={() => onToggle(task)}
              onPress={() => onPressTask(task.taskId)}
            />
          ))}
        </View>
      ) : null}

      <ScrollView ref={scrollRef} style={styles.grid} nestedScrollEnabled>
        {HOURS.map((hour) => {
          const items = byHour.get(hour) ?? [];
          return (
            <View key={hour} style={[styles.hourRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.hourLabel, { color: colors.textMuted }]}>{pad(hour)}:00</Text>
              <Pressable
                style={styles.hourContent}
                onPress={() => (items.length === 0 ? onPressHour(hour) : undefined)}
              >
                {items.length === 0 ? (
                  <View style={styles.emptySlot} />
                ) : (
                  items.map((task) => (
                    <View
                      key={task.taskId}
                      style={[styles.taskChip, { backgroundColor: `${colors.primary}14` }]}
                    >
                      <TaskRow
                        task={task}
                        onComplete={() => onToggle(task)}
                        onPress={() => onPressTask(task.taskId)}
                      />
                    </View>
                  ))
                )}
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      {tasks.length === 0 ? <EmptyState text="Nessun impegno per questo giorno." /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  unscheduled: { marginBottom: spacing.lg },
  grid: { maxHeight: 420 },
  hourRow: {
    flexDirection: 'row',
    minHeight: ROW_HEIGHT,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'stretch',
  },
  hourLabel: {
    width: 56,
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    paddingTop: spacing.sm,
  },
  hourContent: { flex: 1, justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.xs },
  emptySlot: { flex: 1, minHeight: spacing.lg },
  taskChip: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
  },
});
