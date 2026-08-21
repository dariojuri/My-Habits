import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HabitCheckRow } from '@/components/HabitRow';
import { MomentRow } from '@/components/MomentRow';
import { TaskRow } from '@/components/TaskRow';
import { Card, EmptyState, IconButton, SectionTitle } from '@/components/ui';
import { formatLongDate, isToday, shiftKey, todayKey } from '@/lib/date';
import { habitPlannedOn, useAppStore } from '@/store/useAppStore';
import { radius, spacing, useTheme } from '@/theme';

export default function TodayScreen() {
  const { colors } = useTheme();
  const {
    selectedDate,
    setSelectedDate,
    habits,
    completed,
    toggleHabit,
    moments,
    addMoment,
    editMoment,
    removeMoment,
    tasks,
    addTask,
    completeTask,
    removeTask,
  } = useAppStore();
  const [momentDraft, setMomentDraft] = useState('');
  const [taskDraft, setTaskDraft] = useState('');

  const todaysHabits = useMemo(
    () => habits.filter((h) => habitPlannedOn(h, selectedDate)),
    [habits, selectedDate],
  );
  const doneCount = todaysHabits.filter((h) => completed.has(h.id)).length;
  const progress = todaysHabits.length === 0 ? 0 : doneCount / todaysHabits.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
            <SectionTitle>Impegni</SectionTitle>
            {tasks.length === 0 ? (
              <EmptyState text="Nessun impegno in sospeso." />
            ) : (
              tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onComplete={() => void completeTask(task.id)}
                  onDelete={() => void removeTask(task.id)}
                />
              ))
            )}
            <View style={styles.addRow}>
              <TextInput
                value={taskDraft}
                onChangeText={setTaskDraft}
                placeholder="Aggiungi un impegno…"
                placeholderTextColor={colors.textMuted}
                onSubmitEditing={() => {
                  void addTask(taskDraft);
                  setTaskDraft('');
                }}
                style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceAlt }]}
              />
            </View>
          </Card>

          <Card>
            <View style={styles.habitsHeader}>
              <SectionTitle>Abitudini di oggi</SectionTitle>
              <Text style={[styles.counter, { color: colors.text }]}>
                {doneCount} / {todaysHabits.length}
              </Text>
            </View>
            {todaysHabits.length > 0 ? (
              <View style={[styles.progressTrack, { backgroundColor: colors.surfaceAlt }]}>
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: colors.text, width: `${progress * 100}%` },
                  ]}
                />
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
                />
              ))
            )}
          </Card>

          <Card>
            <SectionTitle>Momenti memorabili</SectionTitle>
            {moments.length === 0 ? (
              <EmptyState text="Nessuna voce per questo giorno." />
            ) : (
              moments.map((moment) => (
                <MomentRow
                  key={moment.id}
                  moment={moment}
                  onSave={(text) => void editMoment(moment.id, text)}
                  onDelete={() => void removeMoment(moment.id)}
                />
              ))
            )}
            <View style={styles.addRow}>
              <TextInput
                value={momentDraft}
                onChangeText={setMomentDraft}
                placeholder="Aggiungi un momento…"
                placeholderTextColor={colors.textMuted}
                onSubmitEditing={() => {
                  void addMoment(momentDraft);
                  setMomentDraft('');
                }}
                style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceAlt }]}
              />
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xs },
  headerCenter: { flex: 1, alignItems: 'center' },
  date: { fontSize: 20, fontWeight: '800', textTransform: 'capitalize', textAlign: 'center' },
  backToToday: { fontSize: 12, marginTop: 2, fontWeight: '600' },
  addRow: { marginTop: spacing.sm },
  input: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
  },
  habitsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  counter: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  progressTrack: {
    height: 4,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  progressFill: { height: '100%', borderRadius: radius.pill },
});
