import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HabitFormModal } from '@/components/HabitFormModal';
import { Button, Card, EmptyState, IconButton } from '@/components/ui';
import type { Habit } from '@/db/types';
import { WEEKDAY_LABELS } from '@/lib/date';
import { useAppStore } from '@/store/useAppStore';
import { radius, spacing, useTheme } from '@/theme';

function describe(habit: Habit): string {
  const freq =
    habit.frequencyType === 'daily' || habit.frequencyDays.length === 0
      ? 'Ogni giorno'
      : habit.frequencyDays.map((d) => WEEKDAY_LABELS[d]).join(' · ');
  return habit.reminderTime ? `${freq} · 🔔 ${habit.reminderTime}` : freq;
}

export default function HabitsScreen() {
  const { colors } = useTheme();
  const { habits, addHabit, editHabit, removeHabit, moveHabit } = useAppStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  function confirmDelete(habit: Habit) {
    Alert.alert('Eliminare?', `"${habit.name}" e il suo storico verranno rimossi.`, [
      { text: 'Annulla', style: 'cancel' },
      { text: 'Elimina', style: 'destructive', onPress: () => void removeHabit(habit.id) },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Abitudini</Text>

        {habits.length === 0 ? (
          <Card>
            <EmptyState text="Nessuna abitudine. Creane una per iniziare." />
          </Card>
        ) : (
          habits.map((habit) => (
            <Card key={habit.id} style={styles.card}>
              <View style={[styles.colorBar, { backgroundColor: habit.color }]} />
              <Pressable
                style={styles.info}
                onPress={() => {
                  setEditingHabit(habit);
                  setModalOpen(true);
                }}
              >
                <Text style={[styles.name, { color: colors.text }]}>
                  {habit.emoji} {habit.name}
                </Text>
                <Text style={[styles.meta, { color: colors.textMuted }]}>{describe(habit)}</Text>
              </Pressable>
              <View style={styles.actions}>
                <IconButton
                  label="↑"
                  accessibilityLabel="Sposta su"
                  onPress={() => void moveHabit(habit.id, -1)}
                />
                <IconButton
                  label="↓"
                  accessibilityLabel="Sposta giù"
                  onPress={() => void moveHabit(habit.id, 1)}
                />
                <IconButton
                  label="🗑"
                  accessibilityLabel="Elimina"
                  onPress={() => confirmDelete(habit)}
                />
              </View>
            </Card>
          ))
        )}

        <Button
          label="+ Nuova abitudine"
          onPress={() => {
            setEditingHabit(null);
            setModalOpen(true);
          }}
        />
      </ScrollView>

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
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  title: { fontSize: 24, fontWeight: '700', marginBottom: spacing.xs },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  colorBar: { width: 6, alignSelf: 'stretch', borderRadius: radius.pill },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 12 },
  actions: { flexDirection: 'row', gap: spacing.xs },
});
