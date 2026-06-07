import { useEffect, useState } from 'react';
import {
  I18nManager,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useNameAnalysis, type ElementCategory } from '@/hooks/use-name-analysis';
import { searchQuranByAbjad } from '@/hooks/use-quran-search';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';

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
  const isDark = theme.background === '#0A1628';
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

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.topAccent, { backgroundColor: isDark ? 'rgba(75,184,250,0.03)' : 'rgba(212,175,55,0.04)' }]} />

      <SafeAreaView style={styles.headerContainer} edges={['top']}>
        <SectionHeader
          titleAr="أَسْتْرُولُوجَرْ يَايَا"
          titleEn="ASTROLOGER YAYA"
          style={styles.header}
        />
        <Text style={[styles.tagline, { color: theme.textSecondary }]}>حِسَابُ الْجُمَّلِ وَتَحْلِيلُ الْأَسْمَاءِ</Text>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card variant="glass" style={styles.inputCard}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>الِاسْمُ الْكَامِل</Text>
          <Text style={[styles.inputLabelLatin, { color: theme.textSecondary }]}>Full Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: theme.text }]}
            value={fullName}
            onChangeText={(t) => { setFullName(t); setWantsZodiac(null); setMotherName(''); }}
            placeholder="مَثَلًا: مَرْيَم"
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'}
            textAlign={isRTL ? 'right' : 'left'}
            autoCorrect={false}
          />
        </Card>

        {fullName.trim().length > 1 && result && (
          <View style={styles.resultContainer}>
            <Card variant="elevated" style={styles.quickResultCard}>
              <View style={styles.resultHeader}>
                <Text style={[styles.resultName, { color: theme.text }]}>{result.fullName}</Text>
                <View style={[styles.resultDivider, { backgroundColor: Colors.gold }]} />
              </View>

              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>الْقِيمَة</Text>
                  <Text style={styles.metricValue}>{result.totalValue}</Text>
                  <Text style={styles.metricLabelEn}>Total Value</Text>
                </View>

                <View style={[styles.metricSep, { backgroundColor: theme.border }]} />

                <View style={styles.metricItem}>
                  <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>الْعُنْصُر</Text>
                  <View style={styles.elementRow}>
                    <Text style={[styles.elementIcon, { color: el?.color }]}>{el?.icon}</Text>
                    <Text style={[styles.elementText, { color: el?.color }]}>{result.element}</Text>
                  </View>
                  <Text style={styles.metricLabelEn}>Element</Text>
                </View>
              </View>

              <Button
                title="تَحْلِيلٌ كَامِل"
                subtitle="FULL ANALYSIS"
                variant="gold"
                onPress={handleFullAnalysis}
                style={styles.analysisButton}
              />
            </Card>

            {wantsZodiac === null && (
              <Card variant="solid" style={styles.zodiacPrompt}>
                <Text style={[styles.promptTitle, { color: theme.text }]}>هَلْ تُرِيدُ مَعْرِفَةَ الطَّالِعِ وَالْبُرْج؟</Text>
                <View style={styles.promptButtons}>
                  <Button
                    title="نَعَمْ"
                    variant="primary"
                    onPress={() => setWantsZodiac('yes')}
                    style={styles.promptButton}
                    size="sm"
                  />
                  <Button
                    title="لَا"
                    variant="ghost"
                    onPress={() => setWantsZodiac('no')}
                    style={styles.promptButton}
                    size="sm"
                  />
                </View>
              </Card>
            )}

            {wantsZodiac === 'yes' && (
              <Card variant="solid" style={styles.motherSection}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>اسْمُ الْأُم</Text>
                <Text style={[styles.inputLabelLatin, { color: theme.textSecondary }]}>Mother's Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: theme.text, marginTop: Spacing.two }]}
                  value={motherName}
                  onChangeText={setMotherName}
                  placeholder="مَثَلًا: حَوَّاء"
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'}
                  textAlign={isRTL ? 'right' : 'left'}
                />

                {result.zodiac && (
                  <View style={[styles.extraResult, { backgroundColor: isDark ? 'rgba(75,184,250,0.08)' : 'rgba(75,184,250,0.06)' }]}>
                    <Text style={styles.extraLabel}>الْبُرْج • ZODIAC</Text>
                    <Text style={[styles.extraAr, { color: theme.text }]}>{result.zodiac.ar}</Text>
                    <Text style={[styles.extraEn, { color: theme.textSecondary }]}>{result.zodiac.en}</Text>
                  </View>
                )}

                {verses.length > 0 && (
                  <View style={[styles.extraResult, { backgroundColor: isDark ? 'rgba(212,175,55,0.08)' : 'rgba(212,175,55,0.06)' }]}>
                    <Text style={styles.extraLabel}>الْآيَات • VERSES</Text>
                    <Text style={[styles.extraCount, { color: Colors.gold }]}>{verses.length} matching</Text>
                  </View>
                )}
              </Card>
            )}
          </View>
        )}
      </ScrollView>
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
  headerContainer: {
    alignItems: 'center',
    paddingTop: Spacing.four,
  },
  header: {
    marginBottom: Spacing.one,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
    opacity: 0.6,
    marginBottom: Spacing.two,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
  },
  inputCard: {
    marginBottom: Spacing.three,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: isRTL ? 'right' : 'left',
  },
  inputLabelLatin: {
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
    marginBottom: Spacing.two,
    textAlign: isRTL ? 'right' : 'left',
    opacity: 0.5,
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 20,
    fontWeight: '500',
  },
  resultContainer: {
    gap: Spacing.three,
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
  metricsGrid: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    marginBottom: Spacing.four,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricSep: {
    width: 1,
    height: 36,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.gold,
    marginVertical: 2,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  metricLabelEn: {
    fontSize: 8,
    letterSpacing: 0.5,
    opacity: 0.4,
    marginTop: 1,
  },
  elementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginVertical: 4,
  },
  elementIcon: {
    fontSize: 12,
  },
  elementText: {
    fontSize: 18,
    fontWeight: '700',
  },
  analysisButton: {
    marginTop: Spacing.two,
  },
  zodiacPrompt: {
    padding: Spacing.four,
    alignItems: 'center',
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
  promptButton: {
    flex: 1,
  },
  motherSection: {
    padding: Spacing.four,
  },
  extraResult: {
    marginTop: Spacing.three,
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 14,
  },
  extraLabel: {
    fontSize: 9,
    letterSpacing: 1,
    color: Colors.accent,
    fontWeight: '600',
    marginBottom: Spacing.one,
  },
  extraAr: {
    fontSize: 22,
    fontWeight: '800',
  },
  extraEn: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  extraCount: {
    fontSize: 16,
    fontWeight: '700',
  },
});
