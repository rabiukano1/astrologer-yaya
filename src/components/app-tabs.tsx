import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTheme } from '@/hooks/use-theme';

export default function AppTabs() {
  const theme = useTheme();

  return (
    <NativeTabs
      backgroundColor={theme.background}
      tintColor={theme.text}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>الرَّئِيسِيَّة</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="home" sf="house" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="analyze">
        <NativeTabs.Trigger.Label>التَّحْلِيل</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Label>Analyze</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="search" sf="magnifyingglass" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search">
        <NativeTabs.Trigger.Label>الْبَحْث</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="menu_book" sf="book" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>الإِعْدَادَات</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="settings" sf="gearshape" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
