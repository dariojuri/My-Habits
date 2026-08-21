import { useColorScheme, type ViewStyle } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 28,
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
  primaryText: string;
  danger: string;
  success: string;
  shadow: string;
};

export const lightPalette: Palette = {
  background: '#F0EFEC',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F4F1',
  text: '#131316',
  textMuted: '#84848A',
  border: '#EAE9E5',
  primary: '#131316',
  primaryText: '#FFFFFF',
  danger: '#D64545',
  success: '#131316',
  shadow: '#000000',
};

export const darkPalette: Palette = {
  background: '#0B0B0D',
  surface: '#19191C',
  surfaceAlt: '#222226',
  text: '#F7F7F8',
  textMuted: '#8E8E96',
  border: '#2A2A2F',
  primary: '#F7F7F8',
  primaryText: '#0B0B0D',
  danger: '#F0685C',
  success: '#F7F7F8',
  shadow: '#000000',
};

/** Colori vividi riservati alle abitudini: devono risaltare sulla base neutra grigio/nero. */
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
export function cardShadow(dark: boolean): ViewStyle {
  return dark
    ? {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
        elevation: 4,
      }
    : {
        shadowColor: '#171717',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 3,
      };
}

export function useTheme(): { colors: Palette; dark: boolean } {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  return { colors: dark ? darkPalette : lightPalette, dark };
}
