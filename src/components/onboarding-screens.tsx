import { useCallback, useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import Animated, {
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/hooks/locale-context';

const { width: SCREEN_W } = Dimensions.get('window');

interface OnboardingScreensProps {
  onComplete: () => void;
}

export function OnboardingScreens({ onComplete }: OnboardingScreensProps) {
  const { t, isRTL } = useLocale();
  const theme = useTheme();
  const isDark = theme.background === '#0A1628';
  const [page, setPage] = useState(0);

  const PAGES = [
    {
      icon: 'sparkle.magnifyingglass',
      titleKey: 'onboardingTitle1',
      descKey: 'onboardingDesc1',
      accent: Colors.gold,
    },
    {
      icon: 'person.text.rectangle',
      titleKey: 'onboardingTitle2',
      descKey: 'onboardingDesc2',
      accent: '#FF6B8A',
    },
    {
      icon: 'clock.fill',
      titleKey: 'onboardingTitle3',
      descKey: 'onboardingDesc3',
      accent: '#4BB8FA',
    },
  ];

  const totalPages = PAGES.length;

  const prev = useCallback(() => setPage(p => Math.max(0, p - 1)), []);
  const next = useCallback(() => {
    if (page < totalPages - 1) setPage(p => p + 1);
    else onComplete();
  }, [page, totalPages, onComplete]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.glow, { backgroundColor: PAGES[page].accent + '06' }]} />

      <View style={[styles.topRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {page < totalPages - 1 && (
          <Pressable onPress={onComplete} style={styles.skipBtn}>
            <Text style={[styles.skipText, { color: theme.textSecondary }]}>
              {t('skip')}
            </Text>
          </Pressable>
        )}
      </View>

      <View style={styles.content}>
        {PAGES.map((p, i) => {
          if (i !== page) return null;
          return <PageCard key={i} page={p} theme={theme} t={t} />;
        })}
      </View>

      <View style={styles.bottom}>
        <View style={[styles.dotsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {PAGES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === page
                      ? PAGES[page].accent
                      : isDark
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,0,0,0.1)',
                  width: i === page ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <View style={[styles.navRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {page > 0 && (
            <Pressable
              onPress={prev}
              style={[styles.navBtn, { borderColor: theme.border }]}
            >
              <SymbolView name="chevron.left" size={16} weight="medium" tintColor={theme.text} />
              <Text style={[styles.navBtnText, { color: theme.text }]}>
                {t('back')}
              </Text>
            </Pressable>
          )}
          <Pressable
            onPress={next}
            style={[
              styles.navBtnPrimary,
              { backgroundColor: PAGES[page].accent },
              page === 0 && { flex: 1 },
            ]}
          >
            <Text style={styles.navBtnPrimaryText}>
              {page === totalPages - 1 ? t('getStarted') : t('next')}
            </Text>
            {page < totalPages - 1 && (
              <SymbolView name="chevron.right" size={14} weight="medium" tintColor="#1A1A2E" />
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function PageCard({
  page,
  theme,
  t,
}: {
  page: { icon: string; titleKey: string; descKey: string; accent: string };
  theme: ReturnType<typeof useTheme>;
  t: (key: string) => string;
}) {
  return (
    <Animated.View
      entering={SlideInRight.springify().damping(20)}
      exiting={SlideOutLeft.springify().damping(20)}
      style={styles.pageOuter}
    >
      <View style={[styles.iconCircle, { backgroundColor: page.accent + '12' }]}>
        <View style={[styles.iconInner, { backgroundColor: page.accent + '20' }]}>
          <SymbolView
            name={page.icon as any}
            size={48}
            weight="semibold"
            tintColor={page.accent}
          />
        </View>
      </View>

      <Text style={[styles.title, { color: theme.text }]}>
        {t(page.titleKey)}
      </Text>

      <View style={[styles.divider, { backgroundColor: page.accent + '30' }]} />

      <Text style={[styles.desc, { color: theme.textSecondary }]}>
        {t(page.descKey)}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  glow: {
    position: 'absolute',
    top: -100,
    alignSelf: 'center',
    width: SCREEN_W * 1.2,
    height: SCREEN_W * 1.2,
    borderRadius: SCREEN_W * 0.6,
  },
  topRow: {
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    height: 48,
  },
  skipBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 12,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.6,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.five,
  },
  pageOuter: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four,
  },
  iconInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 2,
  },
  divider: {
    width: 40,
    height: 2,
    borderRadius: 1,
    marginVertical: Spacing.two,
  },
  desc: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  bottom: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  dotsRow: {
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  navRow: {
    gap: Spacing.two,
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  navBtnPrimary: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.three,
    borderRadius: 16,
  },
  navBtnPrimaryText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A2E',
  },
});
