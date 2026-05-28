import { I18nManager, Platform, StatusBar } from 'react-native';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import AppTabs from '@/components/app-tabs';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      I18nManager.forceRTL(true);
      I18nManager.allowRTL(true);
    }
    setTimeout(() => {
      setReady(true);
      SplashScreen.hideAsync();
    }, 1000);
  }, []);

  if (!ready) return null;

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1B4332" />
      <AppTabs />
    </>
  );
}
