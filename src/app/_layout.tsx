import { StatusBar } from 'react-native';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { Colors } from '@/constants/theme';
import { ThemeProvider } from '@/hooks/theme-context';
import { LocaleProvider } from '@/hooks/locale-context';
import { useTheme } from '@/hooks/use-theme';

SplashScreen.preventAutoHideAsync();

function RootContent() {
  const theme = useTheme();
  const isDark = theme.background === Colors.dark.background;

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="relationship" />
        <Stack.Screen name="winner-loser" />
        <Stack.Screen name="planetary-hours" />
        <Stack.Screen name="onboarding" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync();
    setTimeout(() => setReady(true), 400);
  }, []);

  if (!ready) return null;

  return (
    <ThemeProvider>
      <LocaleProvider>
        <RootContent />
      </LocaleProvider>
    </ThemeProvider>
  );
}
