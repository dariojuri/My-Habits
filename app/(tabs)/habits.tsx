import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientFill } from '@/components/Gradient';
import { HabitCheckRow } from '@/components/HabitRow';
import { HabitFormModal } from '@/components/HabitFormModal';
import { Button, Card, EmptyState, IconButton, SectionTitle } from '@/components/ui';
import type { Habit } from '@/db/types';
import { formatLongDate, isToday, shiftKey, todayKey } from '@/lib/date';
import { habitPlannedOn, useAppStore } from '@/store/useAppStore';
import { radius, spacing, useTheme } from '@/theme';

export default function HabitsScreen() {
  const { colors } = useTheme();
  const {
    selectedDate,
    setSelectedDate,
    habits,
    completed,
    toggleHabit,
    editHabit,
    removeHabit,
    moveHabit,
    addHabit,
  } = useAppStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const todaysHabits = useMemo(
    () => habits.filter((h) => habitPlannedOn(h, selectedDate)),
    [habits, selectedDate],
  );
  const doneCount = todaysHabits.filter((h) => completed.has(h.id)).length;
  const progress = todaysHabits.length === 0 ? 0 : doneCount / todaysHabits.length;

  function openManage(habit: Habit) {
    const index = habits.findIndex((h) => h.id === habit.id);
    Alert.alert(habit.name, undefined, [
      {
        text: 'Modifica',
        onPress: () => {
          setEditingHabit(habit);
          setModalOpen(true);
        },
      },
      {
        text: 'Sposta su',
        onPress: () => void moveHabit(habit.id, -1),
        style: index <= 0 ? 'cancel' : 'default',
      },
      {
        text: 'Sposta giù',
        onPress: () => void moveHabit(habit.id, 1),
        style: index >= habits.length - 1 ? 'cancel' : 'default',
      },
      {
        text: 'Elimina',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Eliminare?', `"${habit.name}" e il suo storico verranno rimossi.`, [
            { text: 'Annulla', style: 'cancel' },
            { text: 'Elimina', style: 'destructive', onPress: () => void removeHabit(habit.id) },
          ]);
        },
      },
      { text: 'Annulla', style: 'cancel' },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <IconButton
            label="‹"
            accessibilityLabel="Giorno precedente"
            onPress={() => void setSelectedDate(shiftKey(selectedDate, -1))}
          />
          <View style={styles.headerCenter}>
            <Text style={[styles.date, { color: colors.text }]}>
              {formatLongDate(selectedDate)}
            </Text>
            {!isToday(selectedDate) ? (
              <Text
                onPress={() => void setSelectedDate(todayKey())}
                style={[styles.backToToday, { color: colors.textMuted }]}
              >
                Torna a oggi
              </Text>
            ) : null}
          </View>
          <IconButton
            label="›"
            accessibilityLabel="Giorno successivo"
            onPress={() => void setSelectedDate(shiftKey(selectedDate, 1))}
          />
        </View>

        <Card>
          <View style={styles.cardHeader}>
            <SectionTitle>Abitudini</SectionTitle>
            <View style={[styles.counterBadge, { backgroundColor: `${colors.primary}14` }]}>
              <Text style={[styles.counter, { color: colors.primary }]}>
                {doneCount} / {todaysHabits.length}
              </Text>
            </View>
          </View>
          {todaysHabits.length > 0 ? (
            <View style={[styles.progressTrack, { backgroundColor: colors.surfaceAlt }]}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]}>
                <GradientFill radius={radius.pill} />
              </View>
            </View>
          ) : null}
          {todaysHabits.length === 0 ? (
            <EmptyState text="Nessuna abitudine prevista per questo giorno." />
          ) : (
            todaysHabits.map((habit) => (
              <HabitCheckRow
                key={habit.id}
                habit={habit}
                checked={completed.has(habit.id)}
                onToggle={() => void toggleHabit(habit.id)}
                onLongPress={() => openManage(habit)}
              />
            ))
          )}
        </Card>

        {habits.length === 0 ? (
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Nessuna abitudine ancora: creane una con il pulsante qui sotto.
          </Text>
        ) : null}
      </ScrollView>

      <View style={styles.fabWrap}>
        <Button
          label="+ Nuova abitudine"
          onPress={() => {
            setEditingHabit(null);
            setModalOpen(true);
          }}
        />
      </View>

      <HabitFormModal
        visible={modalOpen}
        habit={editingHabit}
        onClose={() => setModalOpen(false)}
        onSubmit={(input) => {
          if (editingHabit) void editHabit(editingHabit.id, input);
          else void addHabit(input);
          setModalOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 140 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xs },
  headerCenter: { flex: 1, alignItems: 'center' },
  date: { fontSize: 20, fontWeight: '800', textTransform: 'capitalize', textAlign: 'center' },
  backToToday: { fontSize: 12, marginTop: 2, fontWeight: '600' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  counterBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  counter: { fontSize: 13, fontWeight: '800', fontVariant: ['tabular-nums'] },
  progressTrack: {
    height: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  progressFill: { height: '100%', borderRadius: radius.pill, overflow: 'hidden' },
  hint: { textAlign: 'center', fontSize: 13, paddingHorizontal: spacing.lg },
  fabWrap: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
    alignItems: 'center',
  },
});
