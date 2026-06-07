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
    background: '#F5F0E8',
    backgroundElement: 'rgba(245, 240, 225, 0.6)',
    backgroundSelected: 'rgba(237, 232, 214, 0.8)',
    textSecondary: '#6B6B80',
    border: 'rgba(0, 0, 0, 0.06)',
    glass: 'rgba(255, 255, 255, 0.55)',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
  },
  dark: {
    text: '#EDEDEE',
    background: '#0A1628',
    backgroundElement: 'rgba(18, 30, 48, 0.6)',
    backgroundSelected: 'rgba(25, 40, 62, 0.8)',
    textSecondary: '#9CA3AF',
    border: 'rgba(255, 255, 255, 0.06)',
    glass: 'rgba(10, 22, 40, 0.7)',
    surface: '#0F1D30',
    surfaceElevated: '#152338',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  gold: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
};

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
