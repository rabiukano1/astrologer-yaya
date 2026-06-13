import { I18nManager, Platform, StatusBar } from 'react-native';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { Colors } from '@/constants/theme';
import { ThemeProvider } from '@/hooks/theme-context';
import { useTheme } from '@/hooks/use-theme';

SplashScreen.preventAutoHideAsync();

function RootContent() {
  const theme = useTheme();
  const isDark = theme.background === Colors.dark.background;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      I18nManager.forceRTL(true);
      I18nManager.allowRTL(true);
    }
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000);
  }, []);

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
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTimeout(() => setReady(true), 1000);
  }, []);

  if (!ready) return null;

  return (
    <ThemeProvider>
      <RootContent />
    </ThemeProvider>
  );
}
