import { useCallback, useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as dayRatingsDb from '@/db/dayRatings';
import * as momentsDb from '@/db/moments';
import type { DayRating, Moment } from '@/db/types';
import { formatLongDate, type DateKey } from '@/lib/date';
import { radius, spacing, useTheme } from '@/theme';
import { DayRatingWidget } from './DayRatingWidget';
import { MomentRow } from './MomentRow';
import { EmptyState, SectionTitle } from './ui';

export function DayDetailSheet({
  date,
  onClose,
  onChanged,
}: {
  date: DateKey | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { colors } = useTheme();
  const [rating, setRating] = useState<DayRating | null>(null);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [draft, setDraft] = useState('');
  // Tenuta per poter mostrare il contenuto durante l'animazione di chiusura,
  // quando `date` torna a null ma il Modal è ancora visibile a schermo.
  const [displayDate, setDisplayDate] = useState<DateKey | null>(null);

  const load = useCallback(async (d: DateKey) => {
    const [r, m] = await Promise.all([dayRatingsDb.getDayRating(d), momentsDb.listMoments(d)]);
    setRating(r);
    setMoments(m);
  }, []);

  useEffect(() => {
    if (date) {
      setDisplayDate(date);
      setDraft('');
      void load(date);
    }
  }, [date, load]);

  async function refresh() {
    if (!displayDate) return;
    await load(displayDate);
    onChanged();
  }

  return (
    <Modal visible={date !== null} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          {displayDate ? (
            <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>
                  {formatLongDate(displayDate)}
                </Text>
                <Text onPress={onClose} style={[styles.close, { color: colors.primary }]}>
                  Chiudi
                </Text>
              </View>

              <DayRatingWidget
                mood={rating?.mood ?? null}
                score={rating?.score ?? null}
                onMoodChange={(value) => void dayRatingsDb.setMood(displayDate, value).then(refresh)}
                onScoreChange={(value) => void dayRatingsDb.setScore(displayDate, value).then(refresh)}
              />

              <View>
                <SectionTitle>Momenti memorabili</SectionTitle>
                {moments.length === 0 ? (
                  <EmptyState text="Nessuna voce per questo giorno." />
                ) : (
                  moments.map((moment) => (
                    <MomentRow
                      key={moment.id}
                      moment={moment}
                      onSave={(text) => void momentsDb.updateMoment(moment.id, text).then(refresh)}
                      onDelete={() => void momentsDb.deleteMoment(moment.id).then(refresh)}
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
                      if (!draft.trim()) return;
                      void momentsDb.createMoment(displayDate, draft).then(refresh);
                      setDraft('');
                    }}
                    style={[
                      styles.input,
                      { color: colors.text, backgroundColor: colors.surfaceAlt },
                    ]}
                  />
                </View>
              </View>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '90%', borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  title: { fontSize: 20, fontWeight: '800', textTransform: 'capitalize' },
  close: { fontSize: 14, fontWeight: '700', marginTop: spacing.xs },
  addRow: { marginTop: spacing.sm },
  input: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
  },
});
