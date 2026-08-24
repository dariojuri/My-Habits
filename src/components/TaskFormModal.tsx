import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Task, TaskInput } from '@/db/types';
import { WEEKDAY_LABELS, type DateKey } from '@/lib/date';
import { radius, spacing, useTheme } from '@/theme';
import { Button, SectionTitle } from './ui';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function TaskFormModal({
  visible,
  task,
  initialDate,
  initialTime,
  onClose,
  onSubmit,
  onDelete,
}: {
  visible: boolean;
  /** Impegno esistente da modificare; null per crearne uno nuovo. */
  task: Task | null;
  /** Giorno a cui agganciare un nuovo impegno non ricorrente. */
  initialDate: DateKey;
  /** "HH:mm" con cui precompilare l'orario quando si crea un nuovo impegno. */
  initialTime?: string | null;
  onClose: () => void;
  onSubmit: (input: TaskInput) => void;
  onDelete?: () => void;
}) {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const [hasTime, setHasTime] = useState(false);
  const [hour, setHour] = useState(new Date().getHours());
  const [minute, setMinute] = useState(0);
  const [recurring, setRecurring] = useState(false);
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);

  useEffect(() => {
    if (!visible) return;
    setText(task?.text ?? '');
    const time = task?.time ?? (task ? null : (initialTime ?? null));
    if (time) {
      const [h, m] = time.split(':').map(Number);
      setHasTime(true);
      setHour(h);
      setMinute(m);
    } else {
      setHasTime(false);
      setHour(new Date().getHours());
      setMinute(0);
    }
    setRecurring((task?.recurrenceDays.length ?? 0) > 0);
    setRecurrenceDays(task?.recurrenceDays ?? []);
  }, [visible, task, initialTime]);

  function toggleDay(day: number) {
    setRecurrenceDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  }

  function submit() {
    if (!text.trim()) return;
    onSubmit({
      text,
      time: hasTime ? `${pad(hour)}:${pad(minute)}` : null,
      date: initialDate,
      recurrenceDays: recurring ? recurrenceDays : [],
    });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
            <Text style={[styles.title, { color: colors.text }]}>
              {task ? 'Modifica impegno' : 'Nuovo impegno'}
            </Text>

            <View>
              <SectionTitle>Cosa devi fare</SectionTitle>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Es. Chiamare il commercialista"
                placeholderTextColor={colors.textMuted}
                autoFocus={!task}
                style={[
                  styles.input,
                  { color: colors.text, backgroundColor: colors.surface },
                ]}
              />
            </View>

            <View>
              <View style={styles.switchRow}>
                <SectionTitle>Si ripete</SectionTitle>
                <Switch value={recurring} onValueChange={setRecurring} />
              </View>
              {recurring ? (
                <View style={styles.daysRow}>
                  {WEEKDAY_LABELS.map((label, day) => {
                    const active = recurrenceDays.includes(day);
                    return (
                      <Pressable
                        key={label}
                        onPress={() => toggleDay(day)}
                        style={[
                          styles.dayChip,
                          { backgroundColor: active ? colors.primary : colors.surface },
                        ]}
                      >
                        <Text
                          style={{
                            color: active ? colors.primaryText : colors.text,
                            fontSize: 12,
                            fontWeight: '700',
                          }}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
              {recurring ? (
                <Text style={[styles.hint, { color: colors.textMuted }]}>
                  {recurrenceDays.length === 0
                    ? 'Nessun giorno scelto: si ripeterà ogni giorno.'
                    : 'Si ripeterà nei giorni selezionati, ogni settimana.'}
                </Text>
              ) : null}
            </View>

            <View>
              <View style={styles.switchRow}>
                <SectionTitle>Assegna un orario</SectionTitle>
                <Switch value={hasTime} onValueChange={setHasTime} />
              </View>

              {hasTime ? (
                <View style={{ gap: spacing.sm }}>
                  <Text style={[styles.timeLabel, { color: colors.primary }]}>
                    {pad(hour)}:{pad(minute)}
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipRow}>
                      {HOURS.map((h) => (
                        <Pressable
                          key={h}
                          onPress={() => setHour(h)}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: h === hour ? colors.primary : colors.surface,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color: h === hour ? colors.primaryText : colors.text,
                              fontWeight: '600',
                              fontVariant: ['tabular-nums'],
                            }}
                          >
                            {pad(h)}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                  <View style={styles.chipRow}>
                    {MINUTES.map((m) => (
                      <Pressable
                        key={m}
                        onPress={() => setMinute(m)}
                        style={[
                          styles.chip,
                          styles.minuteChip,
                          { backgroundColor: m === minute ? colors.primary : colors.surface },
                        ]}
                      >
                        <Text
                          style={{
                            color: m === minute ? colors.primaryText : colors.text,
                            fontWeight: '600',
                            fontVariant: ['tabular-nums'],
                          }}
                        >
                          :{pad(m)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>

            <View style={{ gap: spacing.sm }}>
              <Button label={task ? 'Salva' : 'Aggiungi impegno'} onPress={submit} />
              {task && onDelete ? (
                <Button label="Elimina impegno" variant="danger" onPress={onDelete} />
              ) : null}
              <Button label="Annulla" variant="ghost" onPress={onClose} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '92%', borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  title: { fontSize: 20, fontWeight: '700' },
  input: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
  },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeLabel: { fontSize: 28, fontWeight: '800', fontVariant: ['tabular-nums'] },
  chipRow: { flexDirection: 'row', gap: spacing.xs },
  chip: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minuteChip: { flex: 1, width: undefined },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md },
  dayChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  hint: { fontSize: 12, marginTop: spacing.sm },
});
