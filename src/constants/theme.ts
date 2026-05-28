import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  primary: '#2C5EAD',
  secondary: '#1591DC',
  accent: '#4BB8FA',
  lightBlue: '#C4E2F5',
  gold: '#D4AF37',
  goldLight: '#F0D68A',
  darkGreen: '#1B4332',
  darkGreenLight: '#2D6A4F',
  cream: '#FFF8E7',
  white: '#FFFFFF',
  black: '#1A1A2E',
  light: {
    text: '#1A1A2E',
    background: '#FFF8E7',
    backgroundElement: '#F5F0E1',
    backgroundSelected: '#EDE8D6',
    textSecondary: '#5C5C6E',
  },
  dark: {
    text: '#FFFFFF',
    background: '#0D1B2A',
    backgroundElement: '#1B2838',
    backgroundSelected: '#243447',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
