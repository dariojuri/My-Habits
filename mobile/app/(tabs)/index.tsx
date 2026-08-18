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
import { Button, Card, EmptyState, IconButton, SectionTitle } from '@/components/ui';
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
  } = useAppStore();
  const [draft, setDraft] = useState('');

  const todaysHabits = useMemo(
    () => habits.filter((h) => habitPlannedOn(h, selectedDate)),
    [habits, selectedDate],
  );
  const doneCount = todaysHabits.filter((h) => completed.has(h.id)).length;

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
                  style={[styles.backToToday, { color: colors.primary }]}
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
                value={draft}
                onChangeText={setDraft}
                placeholder="Aggiungi un momento…"
                placeholderTextColor={colors.textMuted}
                onSubmitEditing={() => {
                  void addMoment(draft);
                  setDraft('');
                }}
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
                ]}
              />
              <Button
                label="+"
                onPress={() => {
                  void addMoment(draft);
                  setDraft('');
                }}
                style={styles.addButton}
              />
            </View>
          </Card>

          <Card>
            <View style={styles.habitsHeader}>
              <SectionTitle>Abitudini di oggi</SectionTitle>
              <Text style={[styles.counter, { color: colors.primary }]}>
                {doneCount} / {todaysHabits.length} completate
              </Text>
            </View>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerCenter: { flex: 1, alignItems: 'center' },
  date: { fontSize: 18, fontWeight: '700', textTransform: 'capitalize', textAlign: 'center' },
  backToToday: { fontSize: 12, marginTop: 2 },
  addRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  input: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
  },
  addButton: { paddingHorizontal: spacing.lg, justifyContent: 'center' },
  habitsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  counter: { fontSize: 14, fontWeight: '700' },
});
