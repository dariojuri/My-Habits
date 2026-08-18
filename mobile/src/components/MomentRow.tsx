import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Moment } from '@/db/types';
import { spacing, useTheme } from '@/theme';

export function MomentRow({
  moment,
  onSave,
  onDelete,
}: {
  moment: Moment;
  onSave: (text: string) => void;
  onDelete: () => void;
}) {
  const { colors } = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(moment.text);

  function commit() {
    setEditing(false);
    if (draft.trim() && draft.trim() !== moment.text) onSave(draft);
    else setDraft(moment.text);
  }

  return (
    <View style={styles.row}>
      <Text style={[styles.bullet, { color: colors.primary }]}>•</Text>
      {editing ? (
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onBlur={commit}
          onSubmitEditing={commit}
          autoFocus
          multiline
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        />
      ) : (
        <Pressable style={styles.textWrap} onPress={() => setEditing(true)}>
          <Text style={[styles.text, { color: colors.text }]}>{moment.text}</Text>
        </Pressable>
      )}
      <Pressable onPress={onDelete} hitSlop={8} accessibilityLabel="Elimina voce">
        <Text style={{ color: colors.textMuted, fontSize: 16 }}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: 6 },
  bullet: { fontSize: 18, lineHeight: 22 },
  textWrap: { flex: 1 },
  text: { fontSize: 16, lineHeight: 22 },
  input: { flex: 1, fontSize: 16, lineHeight: 22, borderBottomWidth: 1, paddingVertical: 2 },
});
