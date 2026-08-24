import type { ViewStyle } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 26,
  xl: 30,
  pill: 999,
} as const;

export type Palette = {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryGradientEnd: string;
  primaryText: string;
  danger: string;
  success: string;
};

/** Unica palette chiara e colorata: niente più dark mode automatica per ora. */
export const palette: Palette = {
  background: '#F1F3FC',
  surface: '#FFFFFF',
  surfaceAlt: '#F4F5FB',
  text: '#1A1B29',
  textMuted: '#8D90A8',
  border: '#E8E9F5',
  primary: '#5B6EF5',
  primaryGradientEnd: '#9B6BF3',
  primaryText: '#FFFFFF',
  danger: '#EF4444',
  success: '#10B981',
};

/** Colori vividi riservati alle abitudini: devono risaltare anche su un'interfaccia già colorata. */
export const habitColors = [
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
];

/** Ombra morbida per dare profondità alle card, coerente in tutta l'app. */
export const cardShadow: ViewStyle = {
  shadowColor: '#3A3F87',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.08,
  shadowRadius: 20,
  elevation: 3,
};

export function useTheme(): { colors: Palette; dark: boolean } {
  return { colors: palette, dark: false };
}
