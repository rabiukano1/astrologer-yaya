import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/hooks/locale-context';

export default function AppTabs() {
  const theme = useTheme();
  const { t } = useLocale();

  return (
    <NativeTabs
      backgroundColor={theme.background}
      tintColor={theme.text}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t('tabHome')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="home" sf="house" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="analyze">
        <NativeTabs.Trigger.Label>{t('tabAnalyze')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="search" sf="magnifyingglass" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search">
        <NativeTabs.Trigger.Label>{t('tabSearch')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="menu_book" sf="book" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>{t('tabSettings')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="settings" sf="gearshape" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
