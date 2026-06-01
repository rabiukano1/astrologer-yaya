import { I18nManager, Platform, StatusBar } from 'react-native';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';

import AppTabs from '@/components/app-tabs';
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
        backgroundColor={isDark ? '#1B4332' : '#FFF8E7'}
      />
      <AppTabs />
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
