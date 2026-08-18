import { useColorScheme } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
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
};

export const lightPalette: Palette = {
  background: '#F7F6F2',
  surface: '#FFFFFF',
  surfaceAlt: '#EFEDE7',
  text: '#1B1B1F',
  textMuted: '#6B6B75',
  border: '#E2DFD7',
  primary: '#4F8DF7',
  primaryText: '#FFFFFF',
  danger: '#D9534F',
  success: '#2E9E6B',
};

export const darkPalette: Palette = {
  background: '#111318',
  surface: '#1A1D24',
  surfaceAlt: '#232733',
  text: '#F2F3F5',
  textMuted: '#9AA0AC',
  border: '#2C313C',
  primary: '#6BA4FF',
  primaryText: '#0B1220',
  danger: '#F07470',
  success: '#4FC08D',
};

export const habitColors = [
  '#4F8DF7',
  '#2E9E6B',
  '#E5A32B',
  '#D9534F',
  '#9B59B6',
  '#16A3A3',
  '#E4708A',
  '#7A869A',
];

export function useTheme(): { colors: Palette; dark: boolean } {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  return { colors: dark ? darkPalette : lightPalette, dark };
}
