import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/hooks/locale-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';

const abjad: Record<string, number> = {
  ا: 1, أ: 1, إ: 1, آ: 1,
  ب: 2,
  ج: 3,
  د: 4,
  ه: 5, ة: 5,
  و: 6,
  ز: 7,
  ح: 8,
  ط: 9,
  ي: 10, ى: 10,
  ك: 20,
  ل: 30,
  م: 40,
  ن: 50,
  س: 60,
  ع: 70,
  ف: 80,
  ص: 90,
  ق: 100,
  ر: 200,
  ش: 300,
  ت: 400,
  ث: 500,
  خ: 600,
  ذ: 700,
  ض: 800,
  ظ: 900,
  غ: 1000,
};

function calcValue(name: string): number {
  return [...name.replace(/[\s\-]/g, '').replace(/[\u064B-\u065F\u0670]/g, '')]
    .reduce((sum, c) => sum + (abjad[c] || 0), 0);
}

function toRemainder(v: number): number {
  const r = v % 9;
  return r === 0 ? 9 : r;
}

function isOdd(n: number): boolean {
  return n % 2 === 1;
}

export default function WinnerLoserScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t, isRTL } = useLocale();
  const isDark = theme.background === '#0A1628';
  const handleBack = useCallback(() => router.back(), [router]);

  const [nameA, setNameA] = useState('');
  const [nameB, setNameB] = useState('');
  const [result, setResult] = useState<{
    aVal: number; aRem: number; aOdd: boolean;
    bVal: number; bRem: number; bOdd: boolean;
    seeking: boolean; winner: 'a' | 'b';
  } | null>(null);

  const calc = () => {
    if (!nameA.trim() || !nameB.trim()) return;
    const aVal = calcValue(nameA.trim());
    const bVal = calcValue(nameB.trim());
    const aRem = toRemainder(aVal);
    const bRem = toRemainder(bVal);
    const aOdd = isOdd(aRem);
    const bOdd = isOdd(bRem);

    if (aRem === bRem) {
      setResult({ aVal, aRem, aOdd, bVal, bRem, bOdd, seeking: true, winner: 'a' });
      return;
    }

    if (aOdd === bOdd) {
      const w = aRem < bRem ? 'a' : 'b';
      setResult({ aVal, aRem, aOdd, bVal, bRem, bOdd, seeking: false, winner: w });
    } else {
      const w = aRem > bRem ? 'a' : 'b';
      setResult({ aVal, aRem, aOdd, bVal, bRem, bOdd, seeking: false, winner: w });
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.topAccent, { backgroundColor: isDark ? 'rgba(255,107,53,0.03)' : 'rgba(255,107,53,0.04)' }]} />

      <SafeAreaView style={styles.safeHeader} edges={['top']}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
        >
          <Text style={styles.backBtnArrow}>←</Text>
        </Pressable>
        <SectionHeader title={t('winnerLoserTitle')} />
      </SafeAreaView>

      <KeyboardAwareScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={20}
      >
        <Card variant="glass">
          <Text style={[styles.label, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>{t('person1')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: theme.text, marginBottom: Spacing.three }]}
            value={nameA}
            onChangeText={(text) => { setNameA(text); setResult(null); }}
            placeholder="مَثَلًا: مُحَمَّد"
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'}
            textAlign={isRTL ? 'right' : 'left'}
            autoCorrect={false}
          />

          <Text style={[styles.label, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>{t('person2')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: theme.text }]}
            value={nameB}
            onChangeText={(text) => { setNameB(text); setResult(null); }}
            placeholder="مَثَلًا: مَرْيَم"
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'}
            textAlign={isRTL ? 'right' : 'left'}
            autoCorrect={false}
          />

          <Button
            title={t('calculate')}
            variant="gold"
            onPress={calc}
            disabled={!nameA.trim() || !nameB.trim()}
            style={styles.calcBtn}
          />
        </Card>

        {result && (
          <>
            <Card variant="glass" style={styles.breakdownCard}>
              <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('valueBreakdown')}</Text>

              <View style={[styles.personRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.personName, { color: theme.text }]}>{nameA.trim()}</Text>
                <View style={styles.personStats}>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>{t('value')}</Text>
                    <Text style={[styles.statValue, { color: Colors.gold }]}>{result.aVal}</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>{t('remainder')}</Text>
                    <Text style={[styles.statValue, { color: Colors.accent }]}>{result.aRem}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: result.aOdd ? Colors.gold : Colors.secondary }]}>
                    <Text style={styles.badgeText}>{result.aOdd ? t('odd') : t('even')}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={[styles.personRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.personName, { color: theme.text }]}>{nameB.trim()}</Text>
                <View style={styles.personStats}>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>{t('value')}</Text>
                    <Text style={[styles.statValue, { color: Colors.gold }]}>{result.bVal}</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>{t('remainder')}</Text>
                    <Text style={[styles.statValue, { color: Colors.accent }]}>{result.bRem}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: result.bOdd ? Colors.gold : Colors.secondary }]}>
                    <Text style={styles.badgeText}>{result.bOdd ? t('odd') : t('even')}</Text>
                  </View>
                </View>
              </View>
            </Card>

            <Card variant="elevated" style={styles.resultCard}>
              {result.seeking ? (
                <>
                  <Text style={styles.resultIcon}>⚖</Text>
                  <Text style={styles.sectionTitle}>{t('seeking')}</Text>
                  <Text style={[styles.resultDesc, { color: theme.textSecondary }]}>
                    كِلَاهُمَا بِهِ الْعَدَدُ نَفْسُهُ {result.aRem}
                  </Text>
                  <Text style={[styles.resultDesc, { color: theme.textSecondary }]}>
                    Both share the same number {result.aRem}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.resultIcon}>
                    {result.winner === 'a' ? '★' : '☆'}
                  </Text>
                  <Text style={[styles.resultTitle, { color: Colors.gold }]}>
                    {result.winner === 'a' ? nameA.trim() : nameB.trim()}
                  </Text>
                  <Text style={styles.sectionTitle}>{t('winner')}</Text>

                  <View style={styles.winnerDivider} />

                  <Text style={[styles.loserName, { color: theme.textSecondary }]}>
                    {result.winner === 'a' ? nameB.trim() : nameA.trim()}
                  </Text>
                  <Text style={[styles.loserLabel, { color: theme.textSecondary }]}>{t('loser')}</Text>
                </>
              )}
            </Card>
          </>
        )}

      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  safeHeader: {
    paddingTop: Spacing.four,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.four,
    marginBottom: Spacing.two,
  },
  backBtnPressed: {
    opacity: 0.5,
  },
  backBtnArrow: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.accent,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 20,
    fontWeight: '500',
  },
  calcBtn: {
    marginTop: Spacing.three,
  },
  breakdownCard: {
    padding: Spacing.four,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gold,
    marginBottom: Spacing.three,
  },
  personRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
  personName: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  personStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 7,
    letterSpacing: 0.5,
    opacity: 0.35,
    color: Colors.gold,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginVertical: Spacing.one,
  },
  resultCard: {
    padding: Spacing.five,
    alignItems: 'center',
  },
  resultIcon: {
    fontSize: 42,
    color: Colors.gold,
    marginBottom: Spacing.two,
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  resultDesc: {
    fontSize: 12,
    marginTop: Spacing.one,
    textAlign: 'center',
  },
  winnerDivider: {
    width: 32,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(212,175,55,0.2)',
    marginVertical: Spacing.three,
  },
  loserName: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  loserLabel: {
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: '500',
    marginTop: Spacing.one,
    opacity: 0.5,
  },
});
