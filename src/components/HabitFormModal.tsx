import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Habit, HabitInput } from '@/db/types';
import { WEEKDAY_LABELS } from '@/lib/date';
import { habitColors, radius, spacing, useTheme } from '@/theme';
import { Button, SectionTitle } from './ui';

const EMPTY: HabitInput = {
  name: '',
  description: '',
  emoji: '⭐',
  color: habitColors[0],
  frequencyType: 'daily',
  frequencyDays: [],
};

export function HabitFormModal({
  visible,
  habit,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  habit: Habit | null;
  onClose: () => void;
  onSubmit: (input: HabitInput) => void;
}) {
  const { colors } = useTheme();
  const [form, setForm] = useState<HabitInput>(EMPTY);
  useEffect(() => {
    if (!visible) return;
    if (habit) {
      setForm({
        name: habit.name,
        description: habit.description,
        emoji: habit.emoji,
        color: habit.color,
        frequencyType: habit.frequencyType,
        frequencyDays: habit.frequencyDays,
      });
    } else {
      setForm(EMPTY);
    }
  }, [visible, habit]);

  function toggleDay(day: number) {
    setForm((prev) => ({
      ...prev,
      frequencyDays: prev.frequencyDays.includes(day)
        ? prev.frequencyDays.filter((d) => d !== day)
        : [...prev.frequencyDays, day].sort(),
    }));
  }

  function submit() {
    if (!form.name.trim()) return;
    onSubmit({
      ...form,
      frequencyDays: form.frequencyType === 'weekly' ? form.frequencyDays : [],
    });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
            <Text style={[styles.title, { color: colors.text }]}>
              {habit ? 'Modifica abitudine' : 'Nuova abitudine'}
            </Text>

            <View>
              <SectionTitle>Nome</SectionTitle>
              <TextInput
                value={form.name}
                onChangeText={(name) => setForm((p) => ({ ...p, name }))}
                placeholder="Es. Leggere 20 minuti"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
                ]}
              />
            </View>

            <View>
              <SectionTitle>Descrizione</SectionTitle>
              <TextInput
                value={form.description}
                onChangeText={(description) => setForm((p) => ({ ...p, description }))}
                placeholder="Facoltativa"
                placeholderTextColor={colors.textMuted}
                multiline
                style={[
                  styles.input,
                  styles.descriptionInput,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
                ]}
              />
            </View>

            <View>
              <SectionTitle>Emoji</SectionTitle>
              <TextInput
                value={form.emoji}
                onChangeText={(emoji) => setForm((p) => ({ ...p, emoji }))}
                maxLength={2}
                style={[
                  styles.input,
                  styles.emojiInput,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
                ]}
              />
            </View>

            <View>
              <SectionTitle>Colore</SectionTitle>
              <View style={styles.colorRow}>
                {habitColors.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => setForm((p) => ({ ...p, color }))}
                    style={[
                      styles.swatch,
                      {
                        backgroundColor: color,
                        borderColor: form.color === color ? colors.text : 'transparent',
                      },
                    ]}
                  />
                ))}
              </View>
            </View>

            <View>
              <SectionTitle>Frequenza</SectionTitle>
              <View style={styles.segment}>
                {(['daily', 'weekly'] as const).map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => setForm((p) => ({ ...p, frequencyType: type }))}
                    style={[
                      styles.segmentItem,
                      {
                        backgroundColor:
                          form.frequencyType === type ? colors.primary : colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: form.frequencyType === type ? colors.primaryText : colors.text,
                        fontWeight: '600',
                      }}
                    >
                      {type === 'daily' ? 'Ogni giorno' : 'Giorni scelti'}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {form.frequencyType === 'weekly' ? (
                <View style={styles.daysRow}>
                  {WEEKDAY_LABELS.map((label, day) => {
                    const active = form.frequencyDays.includes(day);
                    return (
                      <Pressable
                        key={label}
                        onPress={() => toggleDay(day)}
                        style={[
                          styles.dayChip,
                          {
                            backgroundColor: active ? colors.primary : colors.surface,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: active ? colors.primaryText : colors.text,
                            fontSize: 12,
                            fontWeight: '600',
                          }}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>

            <View style={{ gap: spacing.sm }}>
              <Button label={habit ? 'Salva' : 'Crea abitudine'} onPress={submit} />
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
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
  },
  emojiInput: { width: 72, textAlign: 'center', fontSize: 22 },
  descriptionInput: { minHeight: 64, textAlignVertical: 'top' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  swatch: { width: 34, height: 34, borderRadius: radius.pill, borderWidth: 2 },
  segment: { flexDirection: 'row', gap: spacing.sm },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md },
  dayChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
