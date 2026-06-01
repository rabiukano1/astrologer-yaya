import { useEffect, useState } from 'react';
import {
  I18nManager,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useNameAnalysis, type ElementCategory } from '@/hooks/use-name-analysis';
import { searchQuranByAbjad } from '@/hooks/use-quran-search';

const isRTL = I18nManager.isRTL;

const elementMeta: Record<ElementCategory, { color: string; icon: string }> = {
  نار: { color: '#FF6B35', icon: '▲' },
  تراب: { color: '#8B5E3C', icon: '◆' },
  هواء: { color: '#4BB8FA', icon: '●' },
  ماء: { color: '#1591DC', icon: '▼' },
};

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [fullName, setFullName] = useState('');
  const [wantsZodiac, setWantsZodiac] = useState<'yes' | 'no' | null>(null);
  const [motherName, setMotherName] = useState('');
  const result = useNameAnalysis(
    fullName.trim(),
    wantsZodiac === 'yes' && motherName.trim() ? motherName.trim() : ''
  );
  const el = result ? elementMeta[result.element] : null;
  const [verses, setVerses] = useState<Awaited<ReturnType<typeof searchQuranByAbjad>>>([]);
  useEffect(() => {
    if (result?.zodiac) {
      searchQuranByAbjad(result.totalValue).then(setVerses);
    } else {
      setVerses([]);
    }
  }, [result?.zodiac, result?.totalValue]);

  const handleFullAnalysis = () => {
    if (!fullName.trim()) return;
    router.push({
      pathname: '/analyze',
      params: {
        fullName: fullName.trim(),
        ...(motherName.trim() && { motherName: motherName.trim() }),
      },
    });
  };

  const handleZodiacChoice = (choice: 'yes' | 'no') => {
    setWantsZodiac(choice);
    if (choice === 'no') setMotherName('');
  };

  const isDark = theme.background === Colors.dark.background;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.topAccent, { backgroundColor: isDark ? 'rgba(75,184,250,0.04)' : 'rgba(212,175,55,0.06)' }]} />
      <View style={[styles.topGradient, { backgroundColor: theme.background, borderBottomColor: isDark ? 'rgba(75,184,250,0.08)' : 'rgba(0,0,0,0.06)' }]}>
        <SafeAreaView style={styles.safeAreaTop}>
          <View style={styles.ornamentRow}>
            <View style={styles.ornamentLine} />
            <Text style={styles.ornamentSymbol}>﴿</Text>
            <View style={styles.ornamentLine} />
          </View>
          <Text style={[styles.arabicTitle, { color: theme.text }]}>أَسْتْرُولُوجَرْ يَايَا</Text>
          <View style={styles.titleUnderline} />
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>حِسَابُ الْجُمَّلِ وَتَحْلِيلُ الْأَسْمَاءِ</Text>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.inputCard, { backgroundColor: theme.backgroundElement }]}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>الِاسْمُ الْكَامِل</Text>
          <Text style={[styles.inputLabelLatin, { color: theme.textSecondary }]}>Full Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', color: theme.text }]}
            value={fullName}
            onChangeText={setFullName}
            placeholder="مَثَلًا: مَرْيَم"
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'}
            textAlign={isRTL ? 'right' : 'left'}
            autoCorrect={false}
            autoFocus
          />
        </View>

        {result && el ? (
          <>
            <View style={styles.resultSection}>
              <Text style={styles.sectionStep}>النَّتِيجَةُ السَّرِيعَة</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>Quick Result</Text>

              <View style={styles.resultHeader}>
                <Text style={[styles.resultName, { color: theme.text }]}>{result.fullName}</Text>
              </View>

              <View style={[styles.resultMetrics, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]}>
                <View style={styles.resultMetric}>
                  <Text style={styles.resultMetricValue}>{result.totalValue.toLocaleString()}</Text>
                  <Text style={[styles.resultMetricLabel, { color: theme.textSecondary }]}>الْقِيمَة</Text>
                  <Text style={[styles.resultMetricLabelEn, { color: theme.textSecondary }]}>TOTAL</Text>
                </View>
                <View style={[styles.resultMetricSep, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)' }]} />
                <View style={styles.resultMetric}>
                  <Text style={[styles.resultMetricValue, { color: Colors.accent }]}>
                    {result.reducedNumber}
                  </Text>
                  <Text style={[styles.resultMetricLabel, { color: theme.textSecondary }]}>الرَّقْمُ</Text>
                  <Text style={[styles.resultMetricLabelEn, { color: theme.textSecondary }]}>REDUCED</Text>
                </View>
                <View style={[styles.resultMetricSep, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)' }]} />
                <View style={styles.resultMetric}>
                  <Text style={[styles.resultMetricValue, { color: el.color }]}>
                    {el.icon} {result.element}
                  </Text>
                  <Text style={[styles.resultMetricLabel, { color: theme.textSecondary }]}>العُنْصُر</Text>
                  <Text style={[styles.resultMetricLabelEn, { color: theme.textSecondary }]}>ELEMENT</Text>
                </View>
              </View>

              {wantsZodiac === null && (
                <View style={[styles.zodiacPrompt, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                  <Text style={[styles.promptTitle, { color: theme.text }]}>Do you want to find your zodiac?</Text>
                  <View style={styles.promptButtons}>
                    <TouchableOpacity
                      style={styles.promptYes}
                      onPress={() => handleZodiacChoice('yes')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.promptYesText}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.promptNo, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}
                      onPress={() => handleZodiacChoice('no')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.promptNoText, { color: theme.text }]}>No</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {wantsZodiac === 'yes' && (
                <View style={styles.motherSection}>
                  <Text style={styles.sectionStep}>الْبُرْج</Text>
                  <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>ZODIAC</Text>
                  <TextInput
                    style={[styles.motherInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', color: theme.text }]}
                    value={motherName}
                    onChangeText={setMotherName}
                    placeholder="Mother's name"
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'}
                    textAlign={isRTL ? 'right' : 'left'}
                    autoCorrect={false}
                  />
                  {motherName.trim() && result?.zodiac && (
                    <View style={styles.zodiacResult}>
                      <Text style={styles.zodiacResultLabel}>Your Zodiac Sign</Text>
                      <Text style={[styles.zodiacResultAr, { color: theme.text }]}>{result.zodiac.ar}</Text>
                      <Text style={[styles.zodiacResultEn, { color: theme.textSecondary }]}>{result.zodiac.en}</Text>
                    </View>
                  )}

                  {verses.length > 0 && (
                    <View style={[styles.quickVerses, { backgroundColor: isDark ? 'rgba(75,184,250,0.06)' : 'rgba(44,94,173,0.06)' }]}>
                      <Text style={styles.quickVersesLabel}>Abjad-matched Ayat</Text>
                      <Text style={[styles.quickVersesCount, { color: theme.textSecondary }]}>
                        {verses.length} verse{verses.length !== 1 ? 's' : ''} found
                      </Text>
                    </View>
                  )}
                </View>
              )}

              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleFullAnalysis}
                activeOpacity={0.8}
              >
                <Text style={styles.continueButtonText}>﴾ التَّفْصِيلُ الْكَامِلُ ﴿</Text>
                <Text style={styles.continueButtonSub}>FULL ANALYSIS →</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : fullName.trim() ? (
          <View style={styles.waitingState}>
            <Text style={styles.waitingIcon}>﴿</Text>
            <Text style={[styles.waitingText, { color: theme.textSecondary }]}>جَارِ الْحِسَابُ ...</Text>
            <Text style={[styles.waitingTextEn, { color: theme.textSecondary }]}>Calculating...</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  topGradient: {
    paddingBottom: Spacing.three,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomWidth: 1,
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
    opacity: 0.25,
  },
  ornamentSymbol: {
    fontSize: 20,
    color: Colors.lightBlue,
    opacity: 0.35,
  },
  arabicTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  titleUnderline: {
    width: 28,
    height: 2,
    backgroundColor: Colors.accent,
    borderRadius: 1,
    marginTop: Spacing.two,
    alignSelf: 'center',
  },
  tagline: {
    fontSize: 10,
    color: Colors.lightBlue,
    textAlign: 'center',
    opacity: 0.45,
    letterSpacing: 1,
    marginTop: Spacing.one,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.six,
  },
  resultSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: Spacing.five,
  },
  sectionStep: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
    opacity: 0.5,
    letterSpacing: 3,
    marginBottom: Spacing.one,
  },
  sectionSubtitle: {
    fontSize: 10,
    textAlign: 'center',
    opacity: 0.4,
    letterSpacing: 1,
    marginBottom: Spacing.four,
  },
  inputCard: {
    width: '100%',
    borderRadius: 20,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(75,184,250,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: isRTL ? 'right' : 'left',
    marginBottom: 2,
  },
  inputLabelLatin: {
    fontSize: 9,
    textAlign: isRTL ? 'right' : 'left',
    letterSpacing: 1,
    marginBottom: Spacing.two,
    opacity: 0.4,
  },
  input: {
    borderRadius: 14,
    padding: Spacing.three,
    fontSize: 20,
    borderWidth: 1,
    borderColor: 'rgba(75,184,250,0.1)',
    textAlign: 'right',
  },
  waitingState: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.two,
  },
  waitingIcon: {
    fontSize: 40,
    color: Colors.lightBlue,
    opacity: 0.15,
  },
  waitingText: {
    fontSize: 14,
    opacity: 0.3,
  },
  waitingTextEn: {
    fontSize: 9,
    opacity: 0.2,
    letterSpacing: 1,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  resultName: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  resultMetrics: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    width: '100%',
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
  },
  resultMetric: {
    alignItems: 'center',
    flex: 1,
  },
  resultMetricSep: {
    width: 1,
    height: 36,
  },
  resultMetricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.gold,
  },
  resultMetricLabel: {
    fontSize: 9,
    opacity: 0.45,
    marginTop: 2,
  },
  resultMetricLabelEn: {
    fontSize: 7,
    opacity: 0.25,
    letterSpacing: 1,
  },
  continueButton: {
    width: '100%',
    marginTop: Spacing.four,
    backgroundColor: Colors.gold,
    borderRadius: 16,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.darkGreen,
  },
  continueButtonSub: {
    fontSize: 8,
    color: Colors.darkGreen,
    opacity: 0.6,
    letterSpacing: 1,
    marginTop: 2,
  },
  zodiacPrompt: {
    width: '100%',
    alignItems: 'center',
    marginTop: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(75,184,250,0.12)',
  },
  promptTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  promptButtons: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  promptYes: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two,
  },
  promptYesText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.darkGreen,
  },
  promptNo: {
    borderRadius: 12,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two,
    borderWidth: 1,
  },
  promptNoText: {
    fontSize: 14,
    fontWeight: '700',
  },
  motherSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: Spacing.four,
  },
  motherInput: {
    width: '100%',
    borderRadius: 14,
    padding: Spacing.three,
    fontSize: 18,
    borderWidth: 1,
    borderColor: 'rgba(75,184,250,0.1)',
    marginTop: Spacing.two,
  },
  zodiacResult: {
    width: '100%',
    alignItems: 'center',
    marginTop: Spacing.three,
    backgroundColor: 'rgba(75,184,250,0.08)',
    borderRadius: 16,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(75,184,250,0.15)',
  },
  zodiacResultLabel: {
    fontSize: 10,
    color: Colors.accent,
    letterSpacing: 1,
    opacity: 0.6,
    marginBottom: Spacing.two,
  },
  zodiacResultAr: {
    fontSize: 28,
    fontWeight: '700',
  },
  zodiacResultEn: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: Spacing.one,
  },
  zodiacResultTotal: {
    fontSize: 12,
    color: Colors.gold,
    marginTop: Spacing.three,
    opacity: 0.8,
  },
  quickVerses: {
    width: '100%',
    alignItems: 'center',
    marginTop: Spacing.three,
    borderRadius: 14,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(75,184,250,0.1)',
  },
  quickVersesLabel: {
    fontSize: 10,
    color: Colors.accent,
    letterSpacing: 1,
    fontWeight: '600',
  },
  quickVersesCount: {
    fontSize: 9,
    opacity: 0.4,
    marginTop: 2,
  },
});
