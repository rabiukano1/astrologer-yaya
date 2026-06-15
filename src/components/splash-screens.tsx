import { useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { useLocale } from '@/hooks/locale-context';

const { width: W, height: H } = Dimensions.get('window');

function hexToRgb(hex: string) {
  const v = parseInt(hex.replace('#', ''), 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}

function lerpColor(c1: string, c2: string, t: number): string {
  const a = hexToRgb(c1), b = hexToRgb(c2);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bv = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r},${g},${bv})`;
}

function GradientView({ from, to }: { from: string; to: string }) {
  const layers = 16;
  const colors = useMemo(() => {
    const arr: string[] = [];
    for (let i = 0; i < layers; i++) {
      arr.push(lerpColor(from, to, i / (layers - 1)));
    }
    return arr;
  }, [from, to]);

  return (
    <View style={StyleSheet.absoluteFill}>
      {colors.map((c, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: `${(i / layers) * 100}%`,
            left: 0,
            right: 0,
            height: `${100 / layers}%`,
            backgroundColor: c,
          }}
        />
      ))}
    </View>
  );
}

interface Page {
  icon: string;
  labelKey: string;
  headingKey: string;
  descKey: string;
  gradient: readonly [string, string];
  accent: string;
}

interface SplashScreensProps {
  onComplete: () => void;
}

export function SplashScreens({ onComplete }: SplashScreensProps) {
  const { t, isRTL } = useLocale();
  const [page, setPage] = useState(0);

  const PAGES: Page[] = [
    {
      icon: 'sparkle',
      labelKey: 'splashLabel1',
      headingKey: 'splashHeading1',
      descKey: 'splashDesc1',
      gradient: ['#1B4332', '#0A1628'] as const,
      accent: '#D4AF37',
    },
    {
      icon: 'person.text.rectangle',
      labelKey: 'splashLabel2',
      headingKey: 'splashHeading2',
      descKey: 'splashDesc2',
      gradient: ['#0F1D30', '#0A1628'] as const,
      accent: '#4BB8FA',
    },
    {
      icon: 'moon.stars',
      labelKey: 'splashLabel3',
      headingKey: 'splashHeading3',
      descKey: 'splashDesc3',
      gradient: ['#1A0A2E', '#0A1628'] as const,
      accent: '#C084FC',
    },
  ];

  const total = PAGES.length;
  const p = PAGES[page];

  const prev = useCallback(() => setPage(p => Math.max(0, p - 1)), []);
  const next = useCallback(() => {
    if (page < total - 1) setPage(p => p + 1);
    else onComplete();
  }, [page, total, onComplete]);

  return (
    <View style={styles.root}>
      <GradientView from={p.gradient[0]} to={p.gradient[1]} />

      <DecorativeLayer accent={p.accent} page={page} />

      <SafeAreaView style={styles.safe}>
        <View style={[styles.topRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {page < total - 1 && (
            <Pressable onPress={onComplete} style={styles.skipBtn}>
              <Text style={styles.skipText}>{t('skip')}</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.content}>
          <PageContent key={page} page={p} />
        </View>

        <View style={styles.bottom}>
          <View style={[styles.dotsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {PAGES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === page ? p.accent : 'rgba(255,255,255,0.12)',
                    width: i === page ? 28 : 8,
                  },
                ]}
              />
            ))}
          </View>

          <View style={[styles.navRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {page > 0 && (
              <Pressable onPress={prev} style={[styles.navBtn, { borderColor: 'rgba(255,255,255,0.1)' }]}>
                <SymbolView name="chevron.left" size={16} weight="medium" tintColor="rgba(255,255,255,0.7)" />
                <Text style={styles.navBtnText}>{t('back')}</Text>
              </Pressable>
            )}
            <Pressable
              onPress={next}
              style={[
                styles.navBtnPrimary,
                { backgroundColor: p.accent },
                page === 0 && { flex: 1 },
              ]}
            >
              <Text style={styles.navBtnPrimaryText}>
                {page === total - 1 ? t('beginJourney') : t('next')}
              </Text>
              {page < total - 1 && (
                <SymbolView name="chevron.right" size={14} weight="medium" tintColor="#1A1A2E" />
              )}
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function DecorativeLayer({ accent, page }: { accent: string; page: number }) {
  const circleStyles = [
    { size: W * 1.4, top: -W * 0.5, right: -W * 0.3 },
    { size: W * 0.8, bottom: -W * 0.2, left: -W * 0.2 },
    { size: W * 0.5, top: H * 0.2, left: W * 0.1 },
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {circleStyles.map((c, i) => (
        <View
          key={i}
          style={[
            styles.decoCircle,
            {
              width: c.size,
              height: c.size,
              borderRadius: c.size / 2,
              borderColor: i === 2 ? accent + '18' : undefined,
              borderWidth: i === 2 ? 1 : 0,
              backgroundColor: i < 2 ? accent + '06' : undefined,
              ...(c.top !== undefined ? { top: c.top } : {}),
              ...(c.right !== undefined ? { right: c.right } : {}),
              ...(c.bottom !== undefined ? { bottom: c.bottom } : {}),
              ...(c.left !== undefined ? { left: c.left } : {}),
            },
          ]}
        />
      ))}
    </View>
  );
}

function PageContent({ page }: { page: Page }) {
  const { t } = useLocale();
  return (
    <Animated.View entering={FadeIn.duration(500)} style={styles.pageOuter}>
      <View style={[styles.ornamentRing, { borderColor: page.accent + '20' }]}>
        <Text style={[styles.ornament, { color: page.accent }]}>﴿</Text>
      </View>

      <View style={[styles.iconCircle, { backgroundColor: page.accent + '15' }]}>
        <SymbolView
          name={page.icon as any}
          size={36}
          weight="semibold"
          tintColor={page.accent}
        />
      </View>

      <Text style={[styles.label, { color: page.accent }]}>
        {t(page.labelKey)}
      </Text>

      <View style={[styles.divider, { backgroundColor: page.accent + '30' }]} />

      <Text style={styles.heading}>
        {t(page.headingKey)}
      </Text>

      <Text style={styles.desc}>
        {t(page.descKey)}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  decoCircle: {
    position: 'absolute',
  },
  topRow: {
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 8,
    height: 52,
  },
  skipBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  pageOuter: {
    alignItems: 'center',
    gap: 0,
  },
  ornamentRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  ornament: {
    fontSize: 26,
    fontWeight: '700',
    opacity: 0.6,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  divider: {
    width: 32,
    height: 2,
    borderRadius: 1,
    marginTop: 20,
    marginBottom: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    color: '#FFFFFF',
    lineHeight: 38,
  },
  desc: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
    color: 'rgba(255,255,255,0.65)',
    maxWidth: 320,
    marginTop: 16,
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    gap: 20,
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
    gap: 12,
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  navBtnPrimary: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  navBtnPrimaryText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A2E',
  },
});
