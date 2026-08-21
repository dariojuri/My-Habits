import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HabitFormModal } from '@/components/HabitFormModal';
import { Button, Card, EmptyState, IconButton } from '@/components/ui';
import type { Habit } from '@/db/types';
import { useAppStore } from '@/store/useAppStore';
import { radius, spacing, useTheme } from '@/theme';

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
              <View style={[styles.swatch, { backgroundColor: habit.color }]} />
              <Pressable
                style={styles.info}
                onPress={() => {
                  setEditingHabit(habit);
                  setModalOpen(true);
                }}
              >
                <Text style={[styles.name, { color: colors.text }]}>{habit.name}</Text>
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
  title: { fontSize: 28, fontWeight: '800', marginBottom: spacing.xs },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg },
  swatch: { width: 14, height: 14, borderRadius: radius.pill },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: spacing.xs },
});
