import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DayRatingWidget } from '@/components/DayRatingWidget';
import { DayTimeline } from '@/components/DayTimeline';
import { TaskFormModal } from '@/components/TaskFormModal';
import { Card, IconButton, SectionTitle } from '@/components/ui';
import { getTask } from '@/db/tasks';
import type { Task } from '@/db/types';
import { formatLongDate, isToday, shiftKey, todayKey } from '@/lib/date';
import { useAppStore } from '@/store/useAppStore';
import { spacing, useTheme } from '@/theme';

export default function TodayScreen() {
  const { colors } = useTheme();
  const {
    selectedDate,
    setSelectedDate,
    tasks,
    addTask,
    editTask,
    completeTask,
    removeTask,
    todayRating,
    setTodayMood,
    setTodayScore,
  } = useAppStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [prefillHour, setPrefillHour] = useState<number | null>(null);

  function openAdd(hour?: number) {
    setEditingTask(null);
    setPrefillHour(hour ?? null);
    setModalOpen(true);
  }

  async function openEdit(taskId: number) {
    const task = await getTask(taskId);
    if (!task) return;
    setEditingTask(task);
    setPrefillHour(null);
    setModalOpen(true);
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
            <SectionTitle>La tua giornata</SectionTitle>
            <IconButton label="+" accessibilityLabel="Aggiungi impegno" onPress={() => openAdd()} />
          </View>
          <DayTimeline
            date={selectedDate}
            tasks={tasks}
            onToggle={(occurrence) => void completeTask(occurrence)}
            onPressTask={(taskId) => void openEdit(taskId)}
            onPressHour={(hour) => openAdd(hour)}
          />
        </Card>

        {isToday(selectedDate) ? (
          <Card>
            <DayRatingWidget
              mood={todayRating?.mood ?? null}
              score={todayRating?.score ?? null}
              onMoodChange={(value) => void setTodayMood(value)}
              onScoreChange={(value) => void setTodayScore(value)}
            />
          </Card>
        ) : null}
      </ScrollView>

      <TaskFormModal
        visible={modalOpen}
        task={editingTask}
        initialDate={selectedDate}
        initialTime={prefillHour !== null ? `${prefillHour.toString().padStart(2, '0')}:00` : null}
        onClose={() => setModalOpen(false)}
        onSubmit={(input) => {
          if (editingTask) void editTask(editingTask.id, input);
          else void addTask(input);
          setModalOpen(false);
        }}
        onDelete={
          editingTask
            ? () => {
                void removeTask(editingTask.id);
                setModalOpen(false);
              }
            : undefined
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xs },
  headerCenter: { flex: 1, alignItems: 'center' },
  date: { fontSize: 20, fontWeight: '800', textTransform: 'capitalize', textAlign: 'center' },
  backToToday: { fontSize: 12, marginTop: 2, fontWeight: '600' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
