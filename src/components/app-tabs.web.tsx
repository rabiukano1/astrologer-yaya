import {
  Tabs, TabList, TabTrigger, TabSlot,
  TabTriggerSlotProps, TabListProps,
} from 'expo-router/ui';
import { Pressable, View, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AppTabs() {
  const theme = useTheme();

  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href="/" asChild>
            <TabButton>الرَّئِيسِيَّة</TabButton>
          </TabTrigger>
          <TabTrigger name="analyze" href="/analyze" asChild>
            <TabButton>التَّحْلِيل</TabButton>
          </TabTrigger>
          <TabTrigger name="search" href="/search" asChild>
            <TabButton>الْبَحْث</TabButton>
          </TabTrigger>
          <TabTrigger name="settings" href="/settings" asChild>
            <TabButton>الإِعْدَادَات</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  const theme = useTheme();
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <View style={[styles.tabButton, isFocused && { backgroundColor: Colors.primary }]}>
        <ThemedText
          type="small"
          themeColor={isFocused ? 'text' : 'textSecondary'}
          style={isFocused ? styles.tabTextFocused : undefined}>
          {children}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const theme = useTheme();
  return (
    <View {...props} style={[styles.tabListContainer, { backgroundColor: theme.background }]}>
      <View style={[styles.innerContainer, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="smallBold" style={{ color: Colors.gold, marginRight: 'auto' }}>
          أَسْتْرُولُوجَرْ يَايَا
        </ThemedText>
        {props.children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  pressed: {
    opacity: 0.7,
  },
  tabButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  tabTextFocused: {
    fontWeight: '700',
  },
});
