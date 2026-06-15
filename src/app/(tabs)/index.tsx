import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';

import { Colors, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/hooks/locale-context';
import {
  computePlanetaryHours,
  computeSunriseSunset,
  estimateLocationFromTimezone,
  getCurrentPlanetaryHour,
} from '@/data/planetary-hours';

const features = [
  {
    key: 'nameAnalysis',
    subtitleKey: 'nameAnalysisSub',
    symbol: { ios: 'person.text.rectangle', android: 'person', web: 'person' },
    route: '/analyze',
    accent: Colors.gold,
  },
  {
    key: 'winnerLoser',
    subtitleKey: 'winnerLoserSub',
    symbol: { ios: 'arrowtriangle.up.arrowtriangle.down', android: 'compare_arrows', web: 'compare_arrows' },
    route: '/winner-loser',
    accent: '#FF6B35',
  },
  {
    key: 'relationshipNumber',
    subtitleKey: 'relationshipNumberSub',
    symbol: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
    route: '/relationship',
    accent: '#FF6B8A',
  },
  {
    key: 'quranSearch',
    subtitleKey: 'quranSearchSub',
    symbol: { ios: 'book.fill', android: 'book', web: 'book' },
    route: '/search',
    accent: '#4BB8FA',
  },
  {
    key: 'planetaryHours',
    subtitleKey: 'planetaryHoursSub',
    symbol: { ios: 'clock.fill', android: 'schedule', web: 'schedule' },
    route: '/planetary-hours',
    accent: '#9B9BCE',
  },
  {
    key: 'settings',
    subtitleKey: 'settingsSub',
    symbol: { ios: 'gearshape.fill', android: 'settings', web: 'settings' },
    route: '/settings',
    accent: '#9CA3AF',
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 20;
const GRID_GAP = 12;
const CARD_COUNT_PER_ROW = 2;
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / CARD_COUNT_PER_ROW;

function DashboardCard({ feature, index, onPress, theme, isDark, t }: {
  feature: typeof features[number];
  index: number;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
  isDark: boolean;
  t: (key: string) => string;
}) {
  const scale = useSharedValue(1);
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    setTimeout(() => {
      fadeIn.value = withSpring(1, { damping: 20 });
    }, index * 80);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.95, { damping: 20 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
    >
      <Animated.View
        style={[
          { width: CARD_WIDTH },
          animatedStyle,
        ]}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.4)',
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            },
            Shadows.soft,
          ]}
        >
          <View style={[styles.cardAccent, { backgroundColor: feature.accent }]} />
          <View style={styles.cardBody}>
            <View style={[styles.iconWrap, { backgroundColor: feature.accent + '18' }]}>
              <SymbolView
                name={feature.symbol as any}
                size={22}
                weight="semibold"
                tintColor={feature.accent}
              />
            </View>
            <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
              {t(feature.key)}
            </Text>
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
              {t(feature.subtitleKey)}
            </Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

function useRealtimeNow(interval = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}

function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function formatTimeShort(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m} ${ampm}`;
}

function CurrentPlanetCard({
  onPress,
  theme,
  isDark,
  t,
  isRTL,
}: {
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
  isDark: boolean;
  t: (key: string) => string;
  isRTL: boolean;
}) {
  const scale = useSharedValue(1);
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    fadeIn.value = withSpring(1, { damping: 20 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ scale: scale.value }],
  }));

  const location = useRef(estimateLocationFromTimezone()).current;
  const sunTimes = useMemo(
    () => computeSunriseSunset(location.latitude, location.longitude),
    [],
  );
  const hours = useMemo(
    () => {
      if (!sunTimes) return [];
      return computePlanetaryHours(sunTimes.sunrise, sunTimes.sunset);
    },
    [sunTimes?.sunrise?.getTime(), sunTimes?.sunset?.getTime()],
  );

  const now = useRealtimeNow(1000);
  const currentHour = useMemo(
    () => getCurrentPlanetaryHour(hours),
    [hours, now],
  );

  if (!currentHour || !sunTimes) {
    return (
      <View
        style={[
          styles.planetCard,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.4)',
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          },
          Shadows.soft,
        ]}
      >
        <View style={styles.planetCardHeader}>
          <View style={[styles.planetCardLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.planetIconWrap, { backgroundColor: '#9B9BCE18' }]}>
              <SymbolView
                name="clock.fill"
                size={24}
                weight="semibold"
                tintColor="#9B9BCE"
              />
            </View>
            <View style={styles.planetCardNames}>
              <Text style={[styles.planetNameEn, { color: theme.text }]}>
                {t('loading')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  const elapsed = now - currentHour.start.getTime();
  const total = currentHour.end.getTime() - currentHour.start.getTime();
  const progress = Math.min((elapsed / total) * 100, 100);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.98, { damping: 20 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
    >
      <Animated.View
        style={[
          styles.planetCard,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.4)',
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            borderTopColor: currentHour.planet.color,
          },
          Shadows.soft,
          animatedStyle,
        ]}
      >
        <View style={[styles.planetCardHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.planetCardLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View
              style={[
                styles.planetIconWrap,
                { backgroundColor: currentHour.planet.color + '18' },
              ]}
            >
              <SymbolView
                name={currentHour.planet.icon as any}
                size={24}
                weight="semibold"
                tintColor={currentHour.planet.color}
              />
            </View>
            <View style={styles.planetCardNames}>
              <Text style={[styles.planetNameEn, { color: theme.text }]}>
                {currentHour.planet.en}
              </Text>
              <Text style={[styles.planetNameAr, { color: currentHour.planet.color }]}>
                {currentHour.planet.ar}
              </Text>
            </View>
          </View>
          <View style={styles.planetCardRight}>
            <Text style={[styles.nowTime, { color: theme.text }]}>
              {formatTimeShort(new Date(now))}
            </Text>
            <Text style={[styles.planetTimeRange, { color: theme.textSecondary }]}>
              {formatTime(currentHour.start)} — {formatTime(currentHour.end)}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.planetProgressBg,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            },
          ]}
        >
          <View
            style={[
              styles.planetProgressFill,
              {
                backgroundColor: currentHour.planet.color,
                width: `${progress}%` as any,
              },
            ]}
          />
        </View>

        <View style={[styles.planetCardFooter, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View
            style={[
              styles.planetBadge,
              {
                backgroundColor: currentHour.isDay
                  ? Colors.gold + '18'
                  : 'rgba(155,155,206,0.18)',
              },
            ]}
          >
            <SymbolView
              name={currentHour.isDay ? 'sun.max.fill' : 'moon.fill' as any}
              size={10}
              weight="semibold"
              tintColor={currentHour.isDay ? Colors.gold : '#9B9BCE'}
            />
            <Text
              style={[
                styles.planetBadgeText,
                { color: currentHour.isDay ? Colors.gold : '#9B9BCE' },
              ]}
            >
              {currentHour.isDay ? t('day') : t('night')}
            </Text>
          </View>
          <Text style={[styles.planetHourLabel, { color: theme.textSecondary }]}>
            {t('hour')} {currentHour.index}
          </Text>
          <SymbolView
            name="chevron.right"
            size={12}
            weight="medium"
            tintColor={theme.textSecondary}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.background === '#0A1628';
  const { t, isRTL } = useLocale();

  const handlePress = useCallback((route: string) => {
    router.push(route as any);
  }, [router]);

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={styles.bgDecoration} pointerEvents="none">
        <View
          style={[
            styles.bgGlow,
            {
              backgroundColor: isDark
                ? 'rgba(75,184,250,0.06)'
                : 'rgba(212,175,55,0.05)',
            },
          ]}
        />
        <View
          style={[
            styles.bgGlow,
            styles.bgGlow2,
            {
              backgroundColor: isDark
                ? 'rgba(75,184,250,0.03)'
                : 'rgba(212,175,55,0.025)',
            },
          ]}
        />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(400).springify().damping(20)}
            style={styles.header}
          >
            <View style={styles.headerTopRow}>
              <Text style={[styles.greeting, { color: theme.textSecondary }]}>
                {t('dashboard')}
              </Text>
            </View>
            <Text style={[styles.appTitleAr, { color: theme.text }]}>
              {t('appName')}
            </Text>
            <View
              style={[
                styles.divider,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(0,0,0,0.04)',
                },
              ]}
            >
              <View style={[styles.dividerDot, { backgroundColor: Colors.gold }]} />
            </View>
            <Text style={[styles.tagline, { color: theme.textSecondary }]}>
              {t('tagline')}
            </Text>
          </Animated.View>

          {/* Stats Row */}
          <Animated.View
            entering={FadeInDown.delay(150).springify().damping(20)}
            style={[styles.statsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          >
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.03)'
                    : 'rgba(255,255,255,0.25)',
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(0,0,0,0.04)',
                },
              ]}
            >
              <Text style={[styles.statNumber, { color: Colors.gold }]}>٦</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                {t('tools')}
              </Text>
            </View>
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.03)'
                    : 'rgba(255,255,255,0.25)',
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(0,0,0,0.04)',
                },
              ]}
            >
              <Text style={[styles.statNumber, { color: '#4BB8FA' }]}>٩٩</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                {t('namesShort')}
              </Text>
            </View>
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.03)'
                    : 'rgba(255,255,255,0.25)',
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(0,0,0,0.04)',
                },
              ]}
            >
              <Text style={[styles.statNumber, { color: '#FF6B8A' }]}>∞</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                {t('match')}
              </Text>
            </View>
          </Animated.View>

          {/* Current Planet */}
          <CurrentPlanetCard
            onPress={() => router.push('/planetary-hours' as any)}
            theme={theme}
            isDark={isDark}
            t={t}
            isRTL={isRTL}
          />

          {/* Feature Grid */}
          <View style={styles.gridWrapper}>
            <Animated.View
              entering={FadeInDown.delay(100).springify().damping(20)}
              style={styles.sectionHeader}
            >
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {t('features')}
              </Text>
            </Animated.View>
            <View style={[styles.grid, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              {features.map((f, i) => (
                <DashboardCard
                  key={f.route}
                  feature={f}
                  index={i}
                  onPress={() => handlePress(f.route)}
                  theme={theme}
                  isDark={isDark}
                  t={t}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bgDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  bgGlow: {
    position: 'absolute',
    top: -60,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  bgGlow2: {
    top: 40,
    left: 120,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: GRID_PADDING,
    paddingBottom: Spacing.five + 60,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.five,
  },
  headerTopRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Spacing.three,
  },
  greeting: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    opacity: 0.5,
  },
  appTitleAr: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  divider: {
    width: '100%',
    height: 1,
    marginTop: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerDot: {
    width: 40,
    height: 2.5,
    borderRadius: 2,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    opacity: 0.55,
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
    textAlign: 'center',
  },
  statsRow: {
    gap: GRID_GAP,
    marginBottom: Spacing.five,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: Spacing.one,
    textTransform: 'uppercase',
    opacity: 0.6,
  },
  gridWrapper: {
    flex: 1,
  },
  sectionHeader: {
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    opacity: 0.6,
  },
  grid: {
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardAccent: {
    height: 3,
    width: '100%',
    opacity: 0.7,
  },
  cardBody: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    gap: Spacing.one,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: '400',
    textAlign: 'center',
    opacity: 0.55,
  },
  planetCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderTopWidth: 3,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    gap: Spacing.two,
  },
  planetCardHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planetCardLeft: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  planetIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planetCardNames: {
    gap: 2,
  },
  planetNameEn: {
    fontSize: 15,
    fontWeight: '700',
  },
  planetNameAr: {
    fontSize: 11,
    fontWeight: '500',
  },
  planetCardRight: {
    alignItems: 'flex-end',
    gap: 1,
  },
  planetTimeRange: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.5,
    fontVariant: ['tabular-nums'],
  },
  nowTime: {
    fontSize: 15,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  planetProgressBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  planetProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  planetCardFooter: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  planetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  planetBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  planetHourLabel: {
    fontSize: 9,
    fontWeight: '500',
    opacity: 0.4,
    letterSpacing: 0.5,
  },
});
