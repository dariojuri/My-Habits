import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { GradientFill } from './Gradient';
import { radius, spacing, useTheme } from '@/theme';

const MOODS = ['😞', '😕', '😐', '🙂', '😄'];
const SCORES = Array.from({ length: 10 }, (_, i) => i + 1);

function PickerModal({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.popup, { backgroundColor: colors.surface }]}>
          <Text style={[styles.popupTitle, { color: colors.text }]}>{title}</Text>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function DayRatingWidget({
  mood,
  score,
  onMoodChange,
  onScoreChange,
}: {
  mood: number | null;
  score: number | null;
  onMoodChange: (value: number) => void;
  onScoreChange: (value: number) => void;
}) {
  const { colors } = useTheme();
  const [moodOpen, setMoodOpen] = useState(false);
  const [scoreOpen, setScoreOpen] = useState(false);

  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.pill, { backgroundColor: colors.surfaceAlt }]}
        onPress={() => setMoodOpen(true)}
      >
        <Text style={styles.pillEmoji}>{mood ? MOODS[mood - 1] : '🙂'}</Text>
        <Text style={[styles.pillLabel, { color: colors.textMuted }]}>Umore</Text>
      </Pressable>

      <Pressable
        style={[styles.pill, { backgroundColor: colors.surfaceAlt }]}
        onPress={() => setScoreOpen(true)}
      >
        <Text style={[styles.pillValue, { color: colors.text }]}>{score ?? '–'}</Text>
        <Text style={[styles.pillLabel, { color: colors.textMuted }]}>Voto</Text>
      </Pressable>

      <PickerModal visible={moodOpen} title="Come ti senti oggi?" onClose={() => setMoodOpen(false)}>
        <View style={styles.moodGrid}>
          {MOODS.map((emoji, index) => {
            const value = index + 1;
            const active = mood === value;
            return (
              <Pressable
                key={emoji}
                onPress={() => {
                  onMoodChange(value);
                  setMoodOpen(false);
                }}
                style={[
                  styles.moodChip,
                  { backgroundColor: active ? `${colors.primary}1F` : colors.surfaceAlt },
                ]}
              >
                <Text style={styles.moodChipEmoji}>{emoji}</Text>
              </Pressable>
            );
          })}
        </View>
      </PickerModal>

      <PickerModal
        visible={scoreOpen}
        title="Voto generale della giornata"
        onClose={() => setScoreOpen(false)}
      >
        <View style={styles.scoreGrid}>
          {SCORES.map((value) => {
            const active = score === value;
            return (
              <Pressable
                key={value}
                onPress={() => {
                  onScoreChange(value);
                  setScoreOpen(false);
                }}
                style={[
                  styles.scoreChip,
                  { overflow: 'hidden' },
                  !active && { backgroundColor: colors.surfaceAlt },
                ]}
              >
                {active ? <GradientFill radius={radius.pill} /> : null}
                <Text
                  style={{
                    color: active ? colors.primaryText : colors.text,
                    fontWeight: '700',
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {value}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </PickerModal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  pillEmoji: { fontSize: 22 },
  pillValue: { fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] },
  pillLabel: { fontSize: 13, fontWeight: '700' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  popup: { borderRadius: radius.xl, padding: spacing.xl, width: '100%', maxWidth: 340, gap: spacing.lg },
  popupTitle: { fontSize: 16, fontWeight: '800', textAlign: 'center' },
  moodGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  moodChip: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodChipEmoji: { fontSize: 24 },
  scoreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  scoreChip: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
