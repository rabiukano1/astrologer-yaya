import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  I18nManager,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useNameAnalysis, type ElementCategory } from '@/hooks/use-name-analysis';
import { searchQuranByAbjad } from '@/hooks/use-quran-search';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';

const isRTL = I18nManager.isRTL;

const elementMeta: Record<ElementCategory, { color: string; icon: string; bg: string }> = {
  نار: { color: '#FF6B35', icon: '▲', bg: 'rgba(255,107,53,0.08)' },
  تراب: { color: '#8B5E3C', icon: '◆', bg: 'rgba(139,94,60,0.08)' },
  هواء: { color: '#4BB8FA', icon: '●', bg: 'rgba(75,184,250,0.08)' },
  ماء: { color: '#1591DC', icon: '▼', bg: 'rgba(21,145,220,0.08)' },
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
  const { fullName: paramName, motherName: paramMother } = useLocalSearchParams<{
    fullName?: string;
    motherName?: string;
  }>();
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.background === '#0A1628';
  const [inputName, setInputName] = useState(paramName || '');
  const [inputMother, setInputMother] = useState('');
  const [wantsZodiac, setWantsZodiac] = useState<'yes' | 'no' | null>(
    paramMother ? 'yes' : paramName ? 'no' : null
  );

  const effectiveName = paramName || inputName.trim();
  const effectiveMother = paramMother || (wantsZodiac === 'yes' ? inputMother.trim() : '');

  const result = useNameAnalysis(effectiveName, effectiveMother);
  const [verses, setVerses] = useState<Awaited<ReturnType<typeof searchQuranByAbjad>>>([]);

  useEffect(() => {
    if (result?.zodiac) {
      searchQuranByAbjad(result.totalValue).then(setVerses);
    } else {
      setVerses([]);
    }
  }, [result?.zodiac, result?.totalValue]);

  const handleFullAnalysis = () => {
    router.replace({ pathname: '/analyze', params: { fullName: inputName.trim(), ...(inputMother.trim() && { motherName: inputMother.trim() }) } });
  };

  if (!paramName) {
    return (
      <View style={[styles.root, { backgroundColor: theme.background }]}>
        <View style={[styles.elementBg, { backgroundColor: isDark ? 'rgba(75,184,250,0.03)' : 'rgba(212,175,55,0.04)' }]} />
        <SafeAreaView style={styles.headerContainer} edges={['top']}>
          <SectionHeader titleAr="تَحْلِيلُ الْأَسْمَاءِ" titleEn="NAME ANALYSIS" compact />
        </SafeAreaView>
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Card variant="glass" style={styles.inputCard}>
            <Text style={[styles.heroLabel, { color: theme.textSecondary }]}>الِاسْمُ الْكَامِل</Text>
            <TextInput
              style={[localStyles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: theme.text }]}
              value={inputName}
              onChangeText={(t) => { setInputName(t); setWantsZodiac(null); setInputMother(''); }}
              placeholder="مَثَلًا: مَرْيَم"
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'}
              textAlign={isRTL ? 'right' : 'left'}
              autoCorrect={false}
            />
          </Card>

          {inputName.trim().length > 1 && result && (
            <View style={{ gap: Spacing.three }}>
              <Card variant="elevated" style={styles.quickResultCard}>
                <View style={styles.resultHeader}>
                  <Text style={[styles.resultName, { color: theme.text }]}>{result.fullName}</Text>
                  <View style={[styles.resultDivider, { backgroundColor: Colors.gold }]} />
                </View>
                <View style={styles.mainMetrics}>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricValueGold}>{result.totalValue}</Text>
                    <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>الْقِيمَة</Text>
                    <Text style={styles.metricLabelEn}>TOTAL</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={[styles.metricValue, { color: Colors.accent }]}>{result.reducedNumber}</Text>
                    <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>الرَّقْمُ</Text>
                    <Text style={styles.metricLabelEn}>NUMBER</Text>
                  </View>
                </View>
                <View style={[styles.traitsGrid, { justifyContent: 'center' }]}>
                  {elementTraits[result.element].en.map((trait, i) => (
                    <View key={i} style={[styles.traitBadge, { backgroundColor: elementMeta[result.element].color }]}>
                      <Text style={styles.traitText}>{trait}</Text>
                    </View>
                  ))}
                </View>
              </Card>

              {wantsZodiac === null && (
                <Card variant="solid" style={{ padding: Spacing.four, alignItems: 'center' }}>
                  <Text style={[localStyles.promptTitle, { color: theme.text }]}>هَلْ تُرِيدُ مَعْرِفَةَ الطَّالِعِ وَالْبُرْج؟</Text>
                  <View style={localStyles.promptButtons}>
                    <Button title="نَعَمْ" variant="primary" onPress={() => setWantsZodiac('yes')} style={{ flex: 1 }} size="sm" />
                    <Button title="لَا" variant="ghost" onPress={() => setWantsZodiac('no')} style={{ flex: 1 }} size="sm" />
                  </View>
                </Card>
              )}

              {wantsZodiac === 'yes' && (
                <Card variant="solid" style={{ padding: Spacing.four }}>
                  <Text style={[styles.heroLabel, { color: theme.textSecondary }]}>اسْمُ الْأُم</Text>
                  <TextInput
                    style={[localStyles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: theme.text, marginTop: Spacing.two }]}
                    value={inputMother}
                    onChangeText={setInputMother}
                    placeholder="مَثَلًا: حَوَّاء"
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'}
                    textAlign={isRTL ? 'right' : 'left'}
                  />
                  {result.zodiac && (
                    <View style={[styles.verseItem, { backgroundColor: isDark ? 'rgba(75,184,250,0.08)' : 'rgba(75,184,250,0.06)', padding: Spacing.three, borderRadius: 14, marginTop: Spacing.three, alignItems: 'center' }]}>
                      <Text style={[styles.heroLabel, { color: Colors.accent }]}>الْبُرْج • ZODIAC</Text>
                      <Text style={[styles.zodiacAr, { color: theme.text }]}>{result.zodiac.ar}</Text>
                      <Text style={[styles.zodiacEn, { color: theme.textSecondary }]}>{result.zodiac.en}</Text>
                    </View>
                  )}
                  {verses.length > 0 && (
                    <View style={{ backgroundColor: isDark ? 'rgba(212,175,55,0.08)' : 'rgba(212,175,55,0.06)', padding: Spacing.three, borderRadius: 14, marginTop: Spacing.three, alignItems: 'center' }}>
                      <Text style={[styles.heroLabel, { color: Colors.accent }]}>الْآيَات • VERSES</Text>
                      <Text style={{ color: Colors.gold, fontSize: 16, fontWeight: '700' }}>{verses.length} matching</Text>
                    </View>
                  )}
                  {inputMother.trim() && result.zodiac && (
                    <Button title="تَحْلِيلٌ كَامِل" subtitle="FULL ANALYSIS" variant="gold" onPress={handleFullAnalysis} style={{ marginTop: Spacing.three }} />
                  )}
                </Card>
              )}

              {wantsZodiac === 'no' && (
                <Button title="تَحْلِيلٌ كَامِل" subtitle="FULL ANALYSIS" variant="gold" onPress={handleFullAnalysis} />
              )}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  if (!result) {
    return (
      <View style={[styles.root, { backgroundColor: theme.background }]}>
        <SafeAreaView style={styles.emptyContainer}>
          <Text style={styles.ornamentLarge}>﴿</Text>
          <Text style={[styles.errorText, { color: theme.textSecondary }]}>No analysis data found</Text>
          <Button title="رُجُوع" subtitle="GO BACK" onPress={() => router.back()} variant="outline" />
        </SafeAreaView>
      </View>
    );
  }

  const el = elementMeta[result.element];

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.elementBg, { backgroundColor: el.bg }]} />

      <SafeAreaView style={styles.headerContainer} edges={['top']}>
        <SectionHeader
          titleAr="نَتِيجَةُ التَّحْلِيلِ"
          titleEn="FULL ANALYSIS"
          style={styles.header}
          compact
        />
      </SafeAreaView>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="elevated" style={styles.heroCard}>
          <Text style={styles.heroLabel}>الِاسْمُ الْكَامِل</Text>
          <Text style={[styles.heroName, { color: theme.text }]}>{result.fullName}</Text>
          {result.motherName && result.motherName !== '—' && (
            <View style={styles.motherRow}>
              <Text style={[styles.motherPrefix, { color: theme.textSecondary }]}>بِنْتُ</Text>
              <Text style={[styles.motherName, { color: Colors.gold }]}>{result.motherName}</Text>
            </View>
          )}
        </Card>

        <View style={styles.mainMetrics}>
          <Card variant="solid" style={styles.metricCard}>
            <Text style={styles.metricValueGold}>{result.totalValue}</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>الْقِيمَة</Text>
            <Text style={styles.metricLabelEn}>TOTAL</Text>
          </Card>
          <Card variant="solid" style={styles.metricCard}>
            <Text style={[styles.metricValue, { color: Colors.accent }]}>{result.reducedNumber}</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>الرَّقْمُ</Text>
            <Text style={styles.metricLabelEn}>NUMBER</Text>
          </Card>
          <Card variant="solid" style={styles.metricCard}>
            <Text style={[styles.metricValue, { color: Colors.secondary }]}>{result.spiritualNumber}</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>الرُّوحِيّ</Text>
            <Text style={styles.metricLabelEn}>SPIRIT</Text>
          </Card>
        </View>

        <Card variant="glass" style={[styles.elementCard, { borderColor: el.color }]}>
          <View style={styles.elementHeader}>
            <Text style={[styles.elementIcon, { color: el.color }]}>{el.icon}</Text>
            <View>
              <Text style={[styles.elementName, { color: theme.text }]}>{result.element}</Text>
              <Text style={[styles.elementLabel, { color: theme.textSecondary }]}>العُنْصُر • ELEMENT</Text>
            </View>
          </View>
          <View style={styles.traitsGrid}>
            {elementTraits[result.element].en.map((trait, i) => (
              <View key={i} style={[styles.traitBadge, { backgroundColor: el.color }]}>
                <Text style={styles.traitText}>{trait}</Text>
              </View>
            ))}
          </View>
        </Card>

        {result.zodiac && (
          <Card variant="glass" style={styles.zodiacCard}>
            <View style={styles.zodiacContent}>
              <View style={styles.zodiacInfo}>
                <Text style={[styles.zodiacLabel, { color: theme.textSecondary }]}>الْبُرْج • ZODIAC</Text>
                <Text style={[styles.zodiacAr, { color: theme.text }]}>{result.zodiac.ar}</Text>
                <Text style={[styles.zodiacEn, { color: theme.textSecondary }]}>{result.zodiac.en}</Text>
              </View>
              <View style={[styles.zodiacSymbolBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                <Text style={[styles.zodiacSymbol, { color: Colors.accent }]}>♄</Text>
              </View>
            </View>
          </Card>
        )}

        <Card variant="solid" style={styles.meaningCard}>
          <Text style={styles.sectionTitleAr}>مَعْنَى الرَّقْم</Text>
          <Text style={styles.sectionTitleEn}>NUMBER MEANING</Text>
          <View style={[styles.meaningBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
            <Text style={[styles.meaningAr, { color: theme.text }]}>{numberMeanings[result.reducedNumber]?.ar}</Text>
            <Text style={[styles.meaningEn, { color: theme.textSecondary }]}>{numberMeanings[result.reducedNumber]?.en}</Text>
          </View>
        </Card>

        {verses.length > 0 && (
          <Card variant="glass" style={styles.versesCard}>
            <Text style={styles.sectionTitleAr}>الْآيَاتُ الْمُطَابِقَة</Text>
            <Text style={styles.sectionTitleEn}>MATCHING VERSES</Text>
            <View style={styles.versesList}>
              {verses.slice(0, 3).map((v, i) => (
                <View key={i} style={[styles.verseItem, i > 0 && styles.verseBorder]}>
                  <Text style={[styles.verseText, { color: theme.text }]}>{v.text}</Text>
                  <Text style={[styles.verseRef, { color: Colors.accent }]}>
                    {v.surahName} • {v.surah}:{v.verse}
                  </Text>
                </View>
              ))}
              {verses.length > 3 && (
                <Text style={styles.moreVerses}>+{verses.length - 3} more</Text>
              )}
            </View>
          </Card>
        )}

        <Card variant="solid" style={styles.breakdownCard}>
          <Text style={styles.sectionTitleAr}>تَفْصِيلُ الْحُرُوفِ</Text>
          <Text style={styles.sectionTitleEn}>LETTER BREAKDOWN</Text>
          <View style={styles.breakdownTable}>
            {result.letterBreakdown.map((item, index) => {
              const isSep = item.letter === '─';
              return (
                <View key={index} style={[styles.breakdownRow, isSep && styles.breakdownSep]}>
                  <Text style={[styles.breakdownLetter, { color: isSep ? Colors.gold : theme.text }]}>
                    {isSep ? 'مَجْمُوع' : item.letter}
                  </Text>
                  <View style={[styles.breakdownDot, { backgroundColor: theme.border }]} />
                  <Text style={[styles.breakdownValue, { color: isSep ? Colors.gold : Colors.accent }]}>
                    {item.value}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        <Button
          title="تَحْلِيلُ اسْمٍ آخَرَ"
          subtitle="ANALYZE ANOTHER NAME"
          variant="gold"
          onPress={() => router.back()}
          style={styles.backButton}
        />

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>﴿ وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ ﴾</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  elementBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 360,
  },
  headerContainer: {
    paddingTop: Spacing.three,
  },
  header: {
    marginBottom: Spacing.one,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
  },
  heroLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.gold,
    fontWeight: '700',
    opacity: 0.6,
    marginBottom: Spacing.one,
  },
  heroName: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  motherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212,175,55,0.15)',
  },
  motherPrefix: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  motherName: {
    fontSize: 18,
    fontWeight: '700',
  },
  mainMetrics: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  metricValueGold: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.gold,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  metricLabelEn: {
    fontSize: 7,
    letterSpacing: 1,
    opacity: 0.35,
    marginTop: 1,
  },
  elementCard: {
    padding: Spacing.four,
  },
  elementHeader: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  elementIcon: {
    fontSize: 34,
  },
  elementName: {
    fontSize: 26,
    fontWeight: '800',
  },
  elementLabel: {
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 2,
    opacity: 0.6,
  },
  traitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  traitBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  traitText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  zodiacCard: {
    padding: Spacing.four,
  },
  zodiacContent: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  zodiacInfo: {
    flex: 1,
  },
  zodiacLabel: {
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: Spacing.one,
  },
  zodiacAr: {
    fontSize: 24,
    fontWeight: '800',
  },
  zodiacEn: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  zodiacSymbolBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zodiacSymbol: {
    fontSize: 22,
  },
  sectionTitleAr: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gold,
    textAlign: isRTL ? 'right' : 'left',
  },
  sectionTitleEn: {
    fontSize: 8,
    letterSpacing: 1.5,
    opacity: 0.4,
    marginBottom: Spacing.three,
    textAlign: isRTL ? 'right' : 'left',
  },
  meaningCard: {
    padding: Spacing.four,
  },
  meaningBox: {
    borderRadius: 14,
    padding: Spacing.three,
  },
  meaningAr: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: Spacing.one,
  },
  meaningEn: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.8,
  },
  versesCard: {
    padding: Spacing.four,
  },
  versesList: {
    gap: Spacing.three,
  },
  verseItem: {
    gap: Spacing.one,
  },
  verseBorder: {
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
  },
  verseText: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'right',
  },
  verseRef: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'left',
  },
  moreVerses: {
    fontSize: 10,
    textAlign: 'center',
    opacity: 0.3,
    marginTop: Spacing.one,
  },
  breakdownCard: {
    padding: Spacing.four,
  },
  breakdownTable: {
    gap: Spacing.one,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  breakdownSep: {
    marginTop: Spacing.one,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212,175,55,0.15)',
  },
  breakdownLetter: {
    fontSize: 18,
    fontWeight: '600',
    width: 60,
  },
  breakdownDot: {
    flex: 1,
    height: 1,
    marginHorizontal: Spacing.two,
    opacity: 0.3,
  },
  breakdownValue: {
    fontSize: 17,
    fontWeight: '700',
    width: 50,
    textAlign: 'right',
  },
  backButton: {
    marginTop: Spacing.two,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
  footerText: {
    fontSize: 11,
    opacity: 0.25,
  },
  inputCard: {
    marginBottom: Spacing.three,
  },
  quickResultCard: {
    padding: Spacing.four,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  resultName: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  resultDivider: {
    width: 36,
    height: 2.5,
    borderRadius: 2,
    marginTop: Spacing.two,
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.six,
    gap: Spacing.four,
  },
  ornamentLarge: {
    fontSize: 64,
    color: Colors.gold,
    opacity: 0.1,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
  },
});

const localStyles = StyleSheet.create({
  input: {
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 20,
    fontWeight: '500',
  },
  promptTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.three,
    textAlign: 'center',
    lineHeight: 22,
  },
  promptButtons: {
    flexDirection: 'row',
    gap: Spacing.three,
    width: '100%',
  },
});
