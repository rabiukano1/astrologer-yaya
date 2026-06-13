import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  I18nManager,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { Colors, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import {
  computePlanetaryHours,
  computeSunriseSunset,
  estimateLocationFromTimezone,
  getCurrentPlanetaryHour,
  LocationInfo,
  PlanetaryHour,
} from '@/data/planetary-hours';

const isRTL = I18nManager.isRTL;

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

function formatDuration(ms: number): string {
  const totalMin = Math.round(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function useRealTime(interval = 10_000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}

function PlanetIcon({ planet, size = 28 }: { planet: PlanetaryHour['planet']; size?: number }) {
  const padding = Math.round(size * 0.35);
  return (
    <View
      style={{
        width: size + padding * 2,
        height: size + padding * 2,
        borderRadius: (size + padding * 2) / 2,
        backgroundColor: planet.color + '18',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <SymbolView
        name={planet.icon as any}
        size={size}
        weight="semibold"
        tintColor={planet.color}
      />
    </View>
  );
}

export default function PlanetaryHoursScreen() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.background === '#0A1628';
  const handleBack = useCallback(() => router.back(), [router]);

  const [location] = useState<LocationInfo>(() => estimateLocationFromTimezone());
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  const activeLat = useMemo(() => {
    const p = parseFloat(manualLat);
    if (!isNaN(p)) return p;
    return location.latitude;
  }, [location, manualLat]);

  const activeLng = useMemo(() => {
    const p = parseFloat(manualLng);
    if (!isNaN(p)) return p;
    return location.longitude;
  }, [location, manualLng]);

  // Compute sunrise/sunset from location
  const sunTimes = useMemo(
    () => computeSunriseSunset(activeLat, activeLng),
    [activeLat, activeLng],
  );

  const sunriseStr = sunTimes ? formatTime(sunTimes.sunrise) : '--:--';
  const sunsetStr = sunTimes ? formatTime(sunTimes.sunset) : '--:--';

  const hours = useMemo(
    () => {
      if (!sunTimes) return [];
      return computePlanetaryHours(sunTimes.sunrise, sunTimes.sunset);
    },
    [sunTimes?.sunrise?.getTime(), sunTimes?.sunset?.getTime()],
  );

  const now = useRealTime(10_000);
  const currentHour = useMemo(
    () => getCurrentPlanetaryHour(hours),
    [hours, now],
  );

  const scrollRef = useRef<ScrollView>(null);
  const rowRefs = useRef<Record<number, number>>({});

  // Auto-scroll to current hour
  useEffect(() => {
    if (currentHour && rowRefs.current[currentHour.index] !== undefined) {
      const y = rowRefs.current[currentHour.index];
      scrollRef.current?.scrollTo({ y: y - 100, animated: true });
    }
  }, [currentHour?.index]);

  const dayHours = hours.filter((h) => h.isDay);
  const nightHours = hours.filter((h) => !h.isDay);
  const dayDuration = hours.length > 0 && sunTimes
    ? sunTimes.sunset.getTime() - sunTimes.sunrise.getTime()
    : 0;
  const nightDuration = hours.length > 0 && sunTimes
    ? new Date(sunTimes.sunrise.getTime() + 86400000).getTime() - sunTimes.sunset.getTime()
    : 0;

  const dayProgress = currentHour?.isDay
    ? ((now - currentHour.start.getTime()) / (currentHour.end.getTime() - currentHour.start.getTime())) * 100
    : 0;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.topGlow,
          {
            backgroundColor: currentHour
              ? currentHour.planet.color + '08'
              : 'rgba(155,155,206,0.03)',
          },
        ]}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
          >
            <Text style={styles.backBtnArrow}>←</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              {isRTL ? 'السَّاعَاتُ الْكَوْكَبِيَّة' : 'Planetary Hours'}
            </Text>
          </View>
          <Pressable
            onPress={() => setShowConfig((p) => !p)}
            style={({ pressed }) => [styles.configToggle, pressed && { opacity: 0.5 }]}
          >
            <SymbolView
              name="gearshape.fill"
              size={16}
              weight="medium"
              tintColor={showConfig ? Colors.gold : theme.textSecondary}
            />
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Location Bar */}
          <View
            style={[
              styles.locBar,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.2)',
                borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              },
            ]}
          >
            <View style={styles.locRow}>
              <SymbolView
                name="location.fill"
                size={12}
                weight="medium"
                tintColor={Colors.accent}
              />
              <Text style={[styles.locText, { color: theme.textSecondary }]} numberOfLines={1}>
                {location.label}
              </Text>
              <View style={[styles.locDot, { backgroundColor: Colors.accent }]} />
              <Text style={[styles.locSub, { color: theme.textSecondary }]}>
                {activeLat.toFixed(2)}°, {activeLng.toFixed(2)}°
              </Text>
            </View>
          </View>

          {/* Config Panel */}
          {showConfig && (
            <View
              style={[
                styles.configCard,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.2)',
                  borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                },
              ]}
            >
              <Text style={[styles.configTitle, { color: theme.textSecondary }]}>
                {isRTL ? 'الْمَنْطِقَةُ الزَّمَنِيَّة' : 'TIMEZONE \u2022 LOCATION'}
              </Text>
              <View style={styles.configRow}>
                <View style={styles.configField}>
                  <Text style={[styles.configLabel, { color: theme.textSecondary }]}>TIMEZONE</Text>
                  <View
                    style={[
                      styles.configInput,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                        borderColor: currentHour ? currentHour.planet.color + '20' : theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.configValue, { color: theme.text }]}>{location.timezone}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.configRow}>
                <View style={styles.configField}>
                  <Text style={[styles.configLabel, { color: theme.textSecondary }]}>LAT</Text>
                  <Text style={[styles.configValue, { color: theme.text }]}>{activeLat.toFixed(4)}</Text>
                </View>
                <View style={styles.configField}>
                  <Text style={[styles.configLabel, { color: theme.textSecondary }]}>LNG</Text>
                  <Text style={[styles.configValue, { color: theme.text }]}>{activeLng.toFixed(4)}</Text>
                </View>
              </View>
              <View style={styles.sunInfoRow}>
                <View style={styles.sunInfoItem}>
                  <SymbolView name="sun.max.fill" size={12} weight="medium" tintColor={Colors.gold} />
                  <Text style={[styles.sunInfoText, { color: theme.textSecondary }]}>
                    {isRTL ? 'شُرُوق ' : '↑ '}{sunriseStr}
                  </Text>
                </View>
                <Text style={[styles.sunInfoSep, { color: theme.textSecondary }]}>
                  {formatDuration(dayDuration)}
                </Text>
                <View style={styles.sunInfoItem}>
                  <SymbolView name="moon.fill" size={12} weight="medium" tintColor="#9B9BCE" />
                  <Text style={[styles.sunInfoText, { color: theme.textSecondary }]}>
                    {isRTL ? 'غُرُوب ' : '↓ '}{sunsetStr}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Current Hour Hero */}
          {currentHour && (
            <View style={styles.heroOuter}>
              <View style={[styles.heroGlow, { backgroundColor: currentHour.planet.color + '12' }]} />
              <View
                style={[
                  styles.heroCard,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.35)',
                    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    borderTopColor: currentHour.planet.color,
                  },
                  Shadows.medium,
                ]}
              >
                <View style={styles.heroTop}>
                  <PlanetIcon planet={currentHour.planet} size={36} />
                  <View style={styles.heroNameArea}>
                    <Text style={[styles.heroPlanetEn, { color: theme.text }]}>
                      {currentHour.planet.en}
                    </Text>
                    <Text style={[styles.heroPlanetAr, { color: currentHour.planet.color }]}>
                      {currentHour.planet.ar}
                    </Text>
                  </View>
                  <View style={styles.heroTimeArea}>
                    <Text style={[styles.heroTimeBig, { color: theme.text }]}>
                      {formatTimeShort(currentHour.start)}
                    </Text>
                    <Text style={[styles.heroTimeTo, { color: theme.textSecondary }]}>→</Text>
                    <Text style={[styles.heroTimeBig, { color: theme.text }]}>
                      {formatTimeShort(currentHour.end)}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.heroProgress,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.heroProgressFill,
                      {
                        backgroundColor: currentHour.planet.color,
                        width: `${dayProgress}%` as any,
                      },
                    ]}
                  />
                </View>

                <View style={styles.heroMeta}>
                  <View style={styles.heroMetaItem}>
                    <SymbolView
                      name={currentHour.isDay ? 'sun.max.fill' : 'moon.fill'}
                      size={10}
                      weight="semibold"
                      tintColor={currentHour.isDay ? Colors.gold : '#9B9BCE'}
                    />
                    <Text
                      style={[
                        styles.heroMetaText,
                        { color: currentHour.isDay ? Colors.gold : '#9B9BCE' },
                      ]}
                    >
                      {currentHour.isDay ? (isRTL ? 'نَهَار' : 'DAY') : (isRTL ? 'لَيْل' : 'NIGHT')}
                    </Text>
                  </View>
                  <View style={[styles.heroMetaDivider, { backgroundColor: theme.border }]} />
                  <View style={styles.heroMetaItem}>
                    <Text style={[styles.heroMetaText, { color: theme.textSecondary }]}>
                      {isRTL ? 'السَّاعَة' : 'Hour'} {currentHour.index}
                    </Text>
                  </View>
                  <View style={[styles.heroMetaDivider, { backgroundColor: theme.border }]} />
                  <View style={styles.heroMetaItem}>
                    <Text style={[styles.heroMetaText, { color: theme.textSecondary }]}>
                      {currentHour.planet.symbol} {currentHour.planet.en}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Sun Schedule Card */}
          {sunTimes && (
            <View
              style={[
                styles.scheduleCard,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.2)',
                  borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                },
              ]}
            >
              <View style={styles.scheduleRow}>
                <View style={styles.scheduleItem}>
                  <SymbolView name="sunrise.fill" size={16} weight="medium" tintColor={Colors.gold} />
                  <Text style={[styles.scheduleLabel, { color: theme.textSecondary }]}>
                    {isRTL ? 'الشُّرُوق' : 'SUNRISE'}
                  </Text>
                  <Text style={[styles.scheduleTime, { color: theme.text }]}>{sunriseStr}</Text>
                </View>
                <View style={[styles.scheduleDivider, { backgroundColor: theme.border }]} />
                <View style={styles.scheduleItem}>
                  <SymbolView name="sunset.fill" size={16} weight="medium" tintColor="#FF6B8A" />
                  <Text style={[styles.scheduleLabel, { color: theme.textSecondary }]}>
                    {isRTL ? 'الغُرُوب' : 'SUNSET'}
                  </Text>
                  <Text style={[styles.scheduleTime, { color: theme.text }]}>{sunsetStr}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Timeline */}
          <View style={styles.timeline}>
            {dayHours.length > 0 && (
              <>
                <View style={styles.timelineSection}>
                  <Text style={[styles.timelineSectionText, { color: Colors.gold }]}>
                    {isRTL ? 'النَّهَار' : 'DAYTIME'}
                  </Text>
                  <View style={[styles.timelineSectionLine, { backgroundColor: Colors.gold + '30' }]} />
                </View>
                {dayHours.map((h) => (
                  <HourRow
                    key={h.index}
                    hour={h}
                    isActive={currentHour?.index === h.index}
                    isPast={currentHour ? h.index < currentHour.index : false}
                    theme={theme}
                    onLayout={(y) => { rowRefs.current[h.index] = y; }}
                  />
                ))}
              </>
            )}

            {nightHours.length > 0 && (
              <>
                <View style={styles.timelineSection}>
                  <Text style={[styles.timelineSectionText, { color: '#9B9BCE' }]}>
                    {isRTL ? 'اللَّيْل' : 'NIGHTTIME'}
                  </Text>
                  <View style={[styles.timelineSectionLine, { backgroundColor: 'rgba(155,155,206,0.3)' }]} />
                </View>
                {nightHours.map((h) => (
                  <HourRow
                    key={h.index}
                    hour={h}
                    isActive={currentHour?.index === h.index}
                    isPast={currentHour ? h.index < currentHour.index : false}
                    theme={theme}
                    onLayout={(y) => { rowRefs.current[h.index] = y; }}
                  />
                ))}
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function HourRow({
  hour,
  isActive,
  isPast,
  theme,
  onLayout,
}: {
  hour: PlanetaryHour;
  isActive: boolean;
  isPast: boolean;
  theme: ReturnType<typeof useTheme>;
  onLayout: (y: number) => void;
}) {
  const isDark = theme.background === '#0A1628';
  const now = Date.now();
  const elapsed = now - hour.start.getTime();
  const total = hour.end.getTime() - hour.start.getTime();
  const progress = isActive ? Math.min((elapsed / total) * 100, 100) : 0;

  return (
    <View
      onLayout={(e) => onLayout(e.nativeEvent.layout.y)}
      style={[
        styles.hourRow,
        isActive && {
          backgroundColor: hour.planet.color + '0D',
          borderColor: hour.planet.color + '25',
        },
        isPast && !isActive && { opacity: 0.35 },
      ]}
    >
      {/* Time column */}
      <View style={styles.hourTimeCol}>
        <Text
          style={[
            styles.hourTimeStart,
            {
              color: isActive ? hour.planet.color : theme.text,
              fontWeight: isActive ? '700' : '500',
            },
          ]}
        >
          {formatTime(hour.start)}
        </Text>
        <Text style={[styles.hourTimeEnd, { color: isActive ? hour.planet.color : theme.textSecondary }]}>
          {formatTime(hour.end)}
        </Text>
      </View>

      {/* Divider */}
      <View style={[styles.hourVr, { backgroundColor: isActive ? hour.planet.color + '30' : theme.border }]} />

      {/* Icon */}
      <PlanetIcon planet={hour.planet} size={isActive ? 22 : 18} />

      {/* Info */}
      <View style={styles.hourInfo}>
        <View style={styles.hourNameRow}>
          <Text
            style={[
              styles.hourPlanetEn,
              { color: theme.text, fontWeight: isActive ? '700' : '500' },
            ]}
          >
            {hour.planet.en}
          </Text>
          <Text style={[styles.hourPlanetAr, { color: isActive ? hour.planet.color : theme.textSecondary }]}>
            {hour.planet.ar}
          </Text>
        </View>
      </View>

      {/* Active progress bar */}
      {isActive && (
        <View style={styles.hourActiveRight}>
          <View
            style={[
              styles.hourProgressBar,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
            ]}
          >
            <View
              style={[
                styles.hourProgressFill,
                { backgroundColor: hour.planet.color, width: `${progress}%` as any },
              ]}
            />
          </View>
          <View style={[styles.hourActiveDot, { backgroundColor: hour.planet.color }]} />
        </View>
      )}

      {/* Past hour checkmark */}
      {isPast && !isActive && (
        <SymbolView
          name="checkmark.circle.fill"
          size={14}
          weight="medium"
          tintColor={theme.textSecondary + '50'}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topGlow: {
    position: 'absolute',
    top: -80,
    alignSelf: 'center',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  safeArea: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.one,
  },
  backBtnPressed: {
    opacity: 0.5,
  },
  backBtnArrow: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.accent,
  },
  configToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.six + 60,
    gap: Spacing.three,
  },
  // Location bar
  locBar: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  locRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: 6,
  },
  locText: {
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },
  locSub: {
    fontSize: 10,
    fontWeight: '400',
    opacity: 0.5,
    fontVariant: ['tabular-nums'],
  },
  locDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  // Config / Location override
  configCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  configTitle: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
    textTransform: 'uppercase',
    opacity: 0.5,
  },
  configRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    gap: Spacing.two,
  },
  configField: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  configLabel: {
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.4,
  },
  configInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    width: '100%',
    alignItems: 'center',
  },
  configValue: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  sunInfoRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: Spacing.one,
  },
  sunInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sunInfoText: {
    fontSize: 11,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  sunInfoSep: {
    fontSize: 9,
    fontWeight: '600',
    opacity: 0.3,
    fontVariant: ['tabular-nums'],
  },
  // Hero
  heroOuter: {
    alignItems: 'center',
  },
  heroGlow: {
    position: 'absolute',
    top: -10,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  heroCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    borderTopWidth: 3,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  heroTop: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  heroNameArea: {
    flex: 1,
  },
  heroPlanetEn: {
    fontSize: 18,
    fontWeight: '800',
  },
  heroPlanetAr: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  heroTimeArea: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroTimeBig: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  heroTimeTo: {
    fontSize: 12,
    opacity: 0.3,
  },
  heroProgress: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  heroMeta: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroMetaText: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  heroMetaDivider: {
    width: 1,
    height: 10,
  },
  // Schedule
  scheduleCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
  },
  scheduleRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  scheduleItem: {
    alignItems: 'center',
    gap: 4,
  },
  scheduleLabel: {
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    opacity: 0.5,
  },
  scheduleTime: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  scheduleDivider: {
    width: 1,
    height: 32,
  },
  // Timeline
  timeline: {
    gap: 2,
  },
  timelineSection: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  timelineSectionText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    opacity: 0.6,
  },
  timelineSectionLine: {
    flex: 1,
    height: 1,
  },
  // Hour row
  hourRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two + 1,
    paddingHorizontal: Spacing.two,
    borderRadius: 14,
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  hourTimeCol: {
    alignItems: 'center',
    minWidth: 48,
  },
  hourTimeStart: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  hourTimeEnd: {
    fontSize: 9,
    marginTop: 1,
    opacity: 0.4,
    fontVariant: ['tabular-nums'],
  },
  hourVr: {
    width: 1,
    height: 24,
    marginHorizontal: 2,
  },
  hourInfo: {
    flex: 1,
  },
  hourNameRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    gap: Spacing.two,
    alignItems: 'baseline',
  },
  hourPlanetEn: {
    fontSize: 13,
  },
  hourPlanetAr: {
    fontSize: 10,
  },
  hourActiveRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hourProgressBar: {
    width: 40,
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  hourProgressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  hourActiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
