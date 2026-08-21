import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { cardShadow, radius, spacing, useTheme } from '@/theme';

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, dark } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface },
        cardShadow(dark),
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[styles.sectionTitle, { color: colors.text }]}>{children}</Text>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const background =
    variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : 'transparent';
  const textColor =
    variant === 'ghost' ? colors.text : variant === 'danger' ? '#FFFFFF' : colors.primaryText;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: background,
          borderColor: variant === 'ghost' ? colors.border : background,
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.buttonLabel, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({
  label,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: colors.surfaceAlt, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <Text style={{ color: colors.text, fontSize: 16 }}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({ text }: { text: string }) {
  const { colors } = useTheme();
  return <Text style={[styles.empty, { color: colors.textMuted }]}>{text}</Text>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginBottom: spacing.md,
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  buttonLabel: { fontSize: 15, fontWeight: '700' },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { fontSize: 14, fontStyle: 'italic', paddingVertical: spacing.sm },
});
