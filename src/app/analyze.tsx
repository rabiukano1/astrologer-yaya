import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  I18nManager,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useNameAnalysis, type ElementCategory } from '@/hooks/use-name-analysis';
import { searchQuranByAbjad } from '@/hooks/use-quran-search';

const isRTL = I18nManager.isRTL;

const elementMeta: Record<ElementCategory, { color: string; icon: string; bg: string }> = {
  نار: { color: '#FF6B35', icon: '▲', bg: 'rgba(255,107,53,0.15)' },
  تراب: { color: '#8B5E3C', icon: '◆', bg: 'rgba(139,94,60,0.15)' },
  هواء: { color: '#4BB8FA', icon: '●', bg: 'rgba(75,184,250,0.15)' },
  ماء: { color: '#1591DC', icon: '▼', bg: 'rgba(21,145,220,0.15)' },
};

const elementTraits: Record<ElementCategory, { ar: string[]; en: string[] }> = {
  نار: {
    ar: ['قِيَادَة', 'شَجَاعَة', 'حَمَاس', 'طَاقَة'],
    en: ['Leadership', 'Courage', 'Passion', 'Energy'],
  },
  تراب: {
    ar: ['ثَبَات', 'عَمَلِيَّة', 'وَفَاء', 'صَبْر'],
    en: ['Stability', 'Practicality', 'Loyalty', 'Patience'],
  },
  هواء: {
    ar: ['ذَكَاء', 'تَوَاصُل', 'إِبْدَاع', 'حُرِّيَّة'],
    en: ['Intelligence', 'Communication', 'Creativity', 'Freedom'],
  },
  ماء: {
    ar: ['عَاطِفَة', 'حَدَس', 'مَرَوْنَة', 'عُمْق'],
    en: ['Emotion', 'Intuition', 'Flexibility', 'Depth'],
  },
};

const numberMeanings: Record<number, { ar: string; en: string }> = {
  1: { ar: 'الْبَدْء – قِيَادَة وَاسْتِقْلَال', en: 'The Beginning – Leadership & Independence' },
  2: { ar: 'التَّعَاوُن – تَوَازُن وَعَلَاقَات', en: 'Cooperation – Balance & Relationships' },
  3: { ar: 'الإِبْدَاع – تَوَاصُل وَتَفَاؤُل', en: 'Creativity – Communication & Optimism' },
  4: { ar: 'الثَّبَات – نِظَام وَعَمَل', en: 'Stability – Order & Hard Work' },
  5: { ar: 'التَّغَيُّر – حُرِّيَّة وَمَغَامَرَة', en: 'Change – Freedom & Adventure' },
  6: { ar: 'المَسْؤُولِيَّة – حُبّ وَرِعَايَة', en: 'Responsibility – Love & Nurture' },
  7: { ar: 'الحِكْمَة – تَأَمُّل وَرُوحَانِيَّة', en: 'Wisdom – Introspection & Spirituality' },
  8: { ar: 'القُوَّة – طُمُوح وَنَجَاح', en: 'Power – Ambition & Success' },
  9: { ar: 'التَّكَامُل – عَطَاء وَحِكْمَة', en: 'Completion – Generosity & Wisdom' },
};

export default function AnalyzeScreen() {
  const { fullName, motherName } = useLocalSearchParams<{
    fullName: string;
    motherName?: string;
  }>();
  const router = useRouter();
  const theme = useTheme();

  const result = useNameAnalysis(fullName || '', motherName || '');
  const [verses, setVerses] = useState<Awaited<ReturnType<typeof searchQuranByAbjad>>>([]);
  useEffect(() => {
    if (result?.zodiac) {
      searchQuranByAbjad(result.totalValue).then(setVerses);
    } else {
      setVerses([]);
    }
  }, [result?.zodiac, result?.totalValue]);

  if (!result) {
    return (
      <View style={[styles.root, { backgroundColor: theme.background }]}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.emptyStateInner}>
            <Text style={styles.ornamentSymbol}>﴿</Text>
            <Text style={styles.errorText}>No name provided</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace({ pathname: '/', params: { t: String(Date.now()) } })}>
              <Text style={styles.primaryButtonText}>← رُجُوع</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const el = elementMeta[result.element];
  const isDark = theme.background === Colors.dark.background;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.topGradient, { backgroundColor: theme.background, borderBottomColor: isDark ? 'rgba(75,184,250,0.08)' : 'rgba(0,0,0,0.06)' }]}>
        <SafeAreaView style={styles.safeAreaTop}>
          <View style={styles.ornamentRow}>
            <View style={styles.ornamentDot} />
            <View style={styles.ornamentLine} />
            <Text style={styles.ornamentSymbol}>﴿</Text>
            <View style={styles.ornamentLine} />
            <View style={styles.ornamentDot} />
          </View>
          <Text style={[styles.screenTitle, { color: theme.text }]}>نَتِيجَةُ التَّحْلِيلِ</Text>
          <View style={styles.titleUnderline} />
          <Text style={[styles.screenSubtitle, { color: theme.textSecondary }]}>Abjad Analysis</Text>
        </SafeAreaView>
        <View style={styles.headerBar} />
      </View>

      <ScrollView
        style={styles.scrollOuter}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <View style={[styles.heroCard, { backgroundColor: theme.backgroundElement }]}>
            <Text style={styles.heroLabel}>الِاسْمُ / NAME</Text>
            <Text style={[styles.heroName, { color: theme.text }]}>{result.fullName}</Text>
            {result.motherName && result.motherName !== '—' && (
              <View style={[styles.heroMotherRow, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)' }]}>
                <Text style={styles.heroMotherPrefix}>بِنْتُ</Text>
                <Text style={styles.heroMotherName}>{result.motherName}</Text>
              </View>
            )}
          </View>

          <View style={[styles.profileCard, { backgroundColor: theme.backgroundElement }]}>
            <Text style={styles.profileBadge}>الْمَلَفُّ الرُّوحَانِيّ</Text>
            <Text style={styles.profileBadgeEn}>SPIRITUAL PROFILE</Text>
            <View style={styles.profileRow}>
              <View style={styles.profileItem}>
                <Text style={styles.profileValueAccent}>{result.reducedNumber}</Text>
                <Text style={[styles.profileLabel, { color: theme.textSecondary }]}>الرَّقْمُ</Text>
                <Text style={[styles.profileLabelEn, { color: theme.textSecondary }]}>NUMBER</Text>
              </View>
              <View style={styles.profileDot} />
              <View style={styles.profileItem}>
                <Text style={[styles.profileValue, { color: el.color }]}>{el.icon}</Text>
                <Text style={[styles.profileLabel, { color: theme.textSecondary }]}>العُنْصُر</Text>
                <Text style={[styles.profileLabelEn, { color: theme.textSecondary }]}>ELEMENT</Text>
              </View>
              {result.zodiac && <View style={styles.profileDot} />}
              {result.zodiac && (
                <View style={styles.profileItem}>
                  <Text style={[styles.profileValue, { color: Colors.accent }]}>♄</Text>
                  <Text style={[styles.profileLabel, { color: theme.textSecondary }]}>البُرْج</Text>
                  <Text style={[styles.profileLabelEn, { color: theme.textSecondary }]}>ZODIAC</Text>
                </View>
              )}
            </View>
            <View style={[styles.profileDescBox, { backgroundColor: isDark ? 'rgba(44,94,173,0.12)' : 'rgba(44,94,173,0.06)' }]}>
              <Text style={[styles.profileDesc, { color: theme.text }]}>
                {result.reducedNumber !== 9
                  ? `رقم ${result.reducedNumber} (${numberMeanings[result.reducedNumber]?.en.split(' – ')[1]}) — عنصر ${result.element}${result.zodiac ? ` — برج ${result.zodiac.ar}` : ''}`
                  : `رقم 9 (${numberMeanings[9]?.en.split(' – ')[1]}) — عنصر ${result.element}${result.zodiac ? ` — برج ${result.zodiac.ar}` : ''}`
                }
              </Text>
            </View>
          </View>

          <View style={[styles.elementCard, { backgroundColor: el.bg, borderColor: el.color }]}>
            <Text style={styles.elementIcon}>{el.icon}</Text>
            <Text style={styles.elementTitle}>العُنْصُر / ELEMENT</Text>
            <Text style={[styles.elementName, { color: el.color }]}>{result.element}</Text>
            <View style={styles.traitsRow}>
              {elementTraits[result.element].en.map((trait, i) => (
                <View key={i} style={[styles.traitBadge, { backgroundColor: el.color }]}>
                  <Text style={styles.traitText}>{trait}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, { backgroundColor: theme.backgroundElement, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)' }]}>
              <Text style={styles.metricValueGold}>{result.totalValue.toLocaleString()}</Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>الْقِيمَة</Text>
              <Text style={[styles.metricLabelEn, { color: theme.textSecondary }]}>TOTAL VALUE</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: theme.backgroundElement, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)' }]}>
              <Text style={styles.metricValueAccent}>{result.reducedNumber}</Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>الرَّقْمُ</Text>
              <Text style={[styles.metricLabelEn, { color: theme.textSecondary }]}>REDUCED</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: theme.backgroundElement, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)' }]}>
              <Text style={styles.metricValueSecondary}>{result.spiritualNumber}</Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>الرُّوحَانِيّ</Text>
              <Text style={[styles.metricLabelEn, { color: theme.textSecondary }]}>SPIRITUAL</Text>
            </View>
          </View>

          {result.zodiac && (
            <View style={[styles.zodiacCard, { backgroundColor: theme.backgroundElement }]}>
              <View style={styles.zodiacSide}>
                <Text style={styles.zodiacNumber}>#{result.zodiac.index}</Text>
                <Text style={[styles.zodiacLabel, { color: theme.textSecondary }]}>البُرْج</Text>
              </View>
              <View style={[styles.zodiacDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]} />
              <View style={styles.zodiacMain}>
                <Text style={[styles.zodiacAr, { color: theme.text }]}>{result.zodiac.ar}</Text>
                <Text style={[styles.zodiacEn, { color: theme.textSecondary }]}>{result.zodiac.en}</Text>
              </View>
            </View>
          )}

          {verses.length > 0 && (
            <View style={[styles.versesCard, { backgroundColor: theme.backgroundElement }]}>
              <View style={styles.versesHeader}>
                <Text style={[styles.versesTitle, { color: Colors.accent }]}>آيَةٌ / AYAH</Text>
                <Text style={[styles.versesSubtitle, { color: theme.textSecondary }]}>قيمتها العددية تطابق اسمك</Text>
                <Text style={[styles.versesSubtitleEn, { color: theme.textSecondary }]}>Abjad value matches your name</Text>
              </View>
              {verses.slice(0, 5).map((v, i) => (
                <View key={i} style={[styles.verseRow, i < Math.min(verses.length, 5) - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)' }]}>
                  <Text style={[styles.verseRef, { color: theme.textSecondary }]}>
                    {v.surahName} #{v.surah}:{v.verse}
                  </Text>
                  <Text style={[styles.verseText, { color: theme.text }]}>{v.text}</Text>
                </View>
              ))}
              {verses.length > 5 && (
                <Text style={[styles.versesMore, { color: theme.textSecondary }]}>+{verses.length - 5} more</Text>
              )}
            </View>
          )}

          <View style={[styles.insightCard, { backgroundColor: isDark ? 'rgba(44,94,173,0.12)' : 'rgba(44,94,173,0.06)', borderColor: isDark ? 'rgba(44,94,173,0.25)' : 'rgba(44,94,173,0.12)' }]}>
            <Text style={styles.insightTitle}>مَعْنَى الرَّقْم / NUMBER MEANING</Text>
            <Text style={[styles.insightAr, { color: theme.text }]}>{numberMeanings[result.reducedNumber]?.ar}</Text>
            <Text style={[styles.insightEn, { color: theme.textSecondary }]}>{numberMeanings[result.reducedNumber]?.en}</Text>
          </View>

          <View style={[styles.breakdownCard, { backgroundColor: theme.backgroundElement, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)' }]}>
            <Text style={styles.breakdownTitle}>تَفْصِيلُ الْحُرُوفِ</Text>
            <Text style={[styles.breakdownTitleEn, { color: theme.textSecondary }]}>LETTER-BY-LETTER BREAKDOWN</Text>
            <View style={styles.breakdownTable}>
              <View style={[styles.breakdownHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)' }]}>
                <Text style={[styles.breakdownHeaderCell, { color: theme.textSecondary }]}>الْحَرْف</Text>
                <Text style={[styles.breakdownHeaderCell, { color: theme.textSecondary }]}>الْقِيمَة</Text>
              </View>
              {result.letterBreakdown.map((item, index) => {
                const isSeparator = item.letter === '─';
                return (
                  <View
                    key={index}
                    style={[
                      styles.breakdownRow,
                      isSeparator && [styles.breakdownRowSep, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }],
                    ]}
                  >
                    <Text style={[
                      styles.breakdownLetter,
                      isSeparator && styles.breakdownSepText,
                      { color: isSeparator ? undefined : theme.text },
                    ]}>
                      {isSeparator ? `المجموع ${index === 0 ? 'الأوَّل' : 'الثَّانِي'}` : item.letter}
                    </Text>
                    <Text style={[
                      styles.breakdownValue,
                      isSeparator && styles.breakdownSepValue,
                    ]}>
                      {isSeparator ? `= ${item.value}` : item.value}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace({ pathname: '/', params: { t: String(Date.now()) } })}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>﴾ تَحْلِيلُ اسْمٍ آخَرَ ﴿</Text>
            <Text style={styles.primaryButtonSub}>ANALYZE ANOTHER NAME</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerOrnament}>﴿ بِسْمِ اللَّهِ ﴾</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topGradient: {
    paddingBottom: Spacing.three,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  safeAreaTop: {
    alignItems: 'center',
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  ornamentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  ornamentLine: {
    width: 24,
    height: 1,
    backgroundColor: Colors.accent,
    opacity: 0.3,
  },
  ornamentDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.accent,
    opacity: 0.4,
  },
  ornamentSymbol: {
    fontSize: 20,
    color: Colors.lightBlue,
    opacity: 0.4,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  titleUnderline: {
    width: 30,
    height: 2,
    backgroundColor: Colors.accent,
    borderRadius: 1,
    marginTop: Spacing.two,
    alignSelf: 'center',
  },
  screenSubtitle: {
    fontSize: 10,
    letterSpacing: 3,
    textAlign: 'center',
    marginTop: Spacing.two,
  },
  headerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.accent,
    opacity: 0.3,
  },
  scrollOuter: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.six,
  },
  contentWrapper: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.three,
    maxWidth: MaxContentWidth + Spacing.five * 2,
    alignSelf: 'center',
    width: '100%',
  },
  heroCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: Spacing.four,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(75,184,250,0.2)',
  },
  heroLabel: {
    fontSize: 10,
    color: Colors.goldLight,
    letterSpacing: 2,
    opacity: 0.5,
    marginBottom: Spacing.one,
  },
  heroName: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  heroMotherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
  },
  heroMotherPrefix: {
    fontSize: 14,
    color: Colors.goldLight,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  heroMotherName: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.goldLight,
  },
  profileCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: Spacing.four,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(75,184,250,0.2)',
  },
  profileBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1,
  },
  profileBadgeEn: {
    fontSize: 8,
    color: Colors.accent,
    opacity: 0.4,
    letterSpacing: 2,
    marginBottom: Spacing.three,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    marginBottom: Spacing.three,
  },
  profileItem: {
    alignItems: 'center',
    gap: Spacing.half,
  },
  profileDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.goldLight,
    opacity: 0.3,
  },
  profileValueAccent: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.accent,
  },
  profileValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  profileLabel: {
    fontSize: 9,
  },
  profileLabelEn: {
    fontSize: 7,
    letterSpacing: 1,
  },
  profileDescBox: {
    borderRadius: 14,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    width: '100%',
  },
  profileDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  elementCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: Spacing.four,
    alignItems: 'center',
    borderWidth: 1,
  },
  elementIcon: {
    fontSize: 32,
    marginBottom: Spacing.one,
  },
  elementTitle: {
    fontSize: 10,
    color: Colors.goldLight,
    letterSpacing: 2,
    opacity: 0.5,
  },
  elementName: {
    fontSize: 34,
    fontWeight: '800',
    marginVertical: Spacing.one,
  },
  traitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  traitBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  traitText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  metricsRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    width: '100%',
    maxWidth: 400,
    gap: Spacing.two,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    padding: Spacing.three,
    alignItems: 'center',
    borderWidth: 1,
  },
  metricValueGold: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.gold,
  },
  metricValueAccent: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.accent,
  },
  metricValueSecondary: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.secondary,
  },
  metricLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  metricLabelEn: {
    fontSize: 7,
    letterSpacing: 1,
  },
  insightCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: Spacing.four,
    alignItems: 'center',
    borderWidth: 1,
  },
  insightTitle: {
    fontSize: 10,
    color: Colors.accent,
    letterSpacing: 1,
    opacity: 0.6,
    marginBottom: Spacing.two,
  },
  insightAr: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
  insightEn: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: Spacing.one,
    lineHeight: 18,
  },
  zodiacCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(75,184,250,0.15)',
  },
  zodiacSide: {
    alignItems: 'center',
    paddingRight: Spacing.four,
  },
  zodiacNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.accent,
  },
  zodiacLabel: {
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 2,
  },
  zodiacDivider: {
    width: 1,
    height: 50,
  },
  zodiacMain: {
    flex: 1,
    alignItems: 'center',
    paddingLeft: Spacing.four,
  },
  zodiacAr: {
    fontSize: 26,
    fontWeight: '700',
  },
  zodiacEn: {
    fontSize: 14,
    marginTop: 2,
  },
  breakdownCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: Spacing.four,
    borderWidth: 1,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gold,
    textAlign: 'center',
  },
  breakdownTitleEn: {
    fontSize: 8,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: Spacing.three,
  },
  breakdownTable: {
    gap: 0,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    marginBottom: Spacing.one,
  },
  breakdownHeaderCell: {
    fontSize: 10,
    letterSpacing: 1,
    textAlign: 'center',
    flex: 1,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
  },
  breakdownRowSep: {
    marginVertical: 2,
  },
  breakdownLetter: {
    fontSize: 22,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
  breakdownSepText: {
    fontSize: 11,
    color: Colors.goldLight,
    opacity: 0.6,
    fontWeight: '600',
  },
  breakdownValue: {
    fontSize: 18,
    color: Colors.accent,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  breakdownSepValue: {
    fontSize: 14,
    color: Colors.gold,
    fontWeight: '700',
  },
  primaryButton: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.gold,
    borderRadius: 16,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.darkGreen,
  },
  primaryButtonSub: {
    fontSize: 8,
    color: Colors.darkGreen,
    letterSpacing: 1,
    marginTop: 2,
    opacity: 0.6,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  footerOrnament: {
    fontSize: 14,
    color: Colors.goldLight,
    opacity: 0.35,
  },
  emptyStateInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
  },
  errorText: {
    fontSize: 18,
    color: Colors.gold,
    textAlign: 'center',
  },
  versesCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(75,184,250,0.15)',
  },
  versesHeader: {
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  versesTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  versesSubtitle: {
    fontSize: 10,
    opacity: 0.5,
    marginTop: Spacing.one,
  },
  versesSubtitleEn: {
    fontSize: 8,
    opacity: 0.3,
    letterSpacing: 1,
    marginTop: 1,
  },
  verseRow: {
    paddingVertical: Spacing.two,
    gap: Spacing.one,
  },
  verseRef: {
    fontSize: 9,
    fontWeight: '600',
    opacity: 0.5,
    letterSpacing: 0.5,
  },
  verseText: {
    fontSize: 15,
    textAlign: 'right',
    lineHeight: 24,
    writingDirection: 'rtl',
  },
  versesMore: {
    fontSize: 11,
    textAlign: 'center',
    opacity: 0.4,
    marginTop: Spacing.two,
  },
});
