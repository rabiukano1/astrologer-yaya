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
import { useNameAnalysis, type ElementCategory } from '@/hooks/use-name-analysis';

const isRTL = I18nManager.isRTL;

const elementColors: Record<ElementCategory, string> = {
  نار: '#FF6B35',
  تراب: '#8B5E3C',
  هواء: '#4BB8FA',
  ماء: '#1591DC',
};

const elementIcons: Record<ElementCategory, string> = {
  نار: '▲',
  تراب: '◆',
  هواء: '●',
  ماء: '▼',
};

const elementDescriptions: Record<ElementCategory, { ar: string; en: string }> = {
  نار: { ar: 'نَارِيَّة – طَاقَةٌ حَارَّةٌ قَوِيَّةٌ، رِيَادَةٌ وَشَجَاعَةٌ', en: 'Fiery – Strong hot energy, leadership and courage' },
  تراب: { ar: 'تُرَابِيَّة – ثَبَاتٌ وَاسْتِقْرَارٌ، عَمَلِيَّةٌ وَمَوْثُوقِيَّةٌ', en: 'Earthy – Stability and groundedness, practical and reliable' },
  هواء: { ar: 'هَوَائِيَّة – ذَكَاءٌ وَتَوَاصُلٌ، إِبْدَاعٌ وَحُرِّيَّةٌ', en: 'Airy – Intelligence and communication, creativity and freedom' },
  ماء: { ar: 'مَائِيَّة – عَاطِفَةٌ وَحَدَسٌ، مَرَوْنَةٌ وَعُمْقٌ عَاطِفِيّ', en: 'Watery – Emotion and intuition, flexibility and emotional depth' },
};

export default function AnalyzeScreen() {
  const { fullName, motherName } = useLocalSearchParams<{
    fullName: string;
    motherName: string;
  }>();
  const router = useRouter();

  const result = useNameAnalysis(fullName || '', motherName || '');

  if (!result) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.errorText}>No name provided</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← رُجُوع</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: Colors.darkGreen }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerOrnament}>
            <Text style={styles.ornamentSymbol}>﴿</Text>
          </View>

          <Text style={styles.screenTitle}>نَتِيجَةُ التَّحْلِيلِ</Text>
          <Text style={styles.screenSubtitle}>ANALYSIS RESULT</Text>

          <View style={styles.nameCard}>
            <Text style={styles.nameLabel}>الِاسْمُ / Name</Text>
            <Text style={styles.nameValue}>{result.fullName}</Text>
            {result.motherName && result.motherName !== '—' && (
              <>
                <Text style={styles.motherLabel}>بِنْتُ / bint</Text>
                <Text style={styles.motherValue}>{result.motherName}</Text>
              </>
            )}
          </View>

          <View style={styles.elementCard}>
            <Text style={styles.elementIcon}>
              {elementIcons[result.element]}
            </Text>
            <Text style={styles.elementTitle}>العُنْصُر / Element</Text>
            <Text style={styles.elementName}>{result.element}</Text>
            <Text style={styles.elementDescAr}>
              {elementDescriptions[result.element].ar}
            </Text>
            <Text style={styles.elementDescEn}>
              {elementDescriptions[result.element].en}
            </Text>
          </View>

          <View style={styles.numbersRow}>
            <View style={styles.numberBox}>
              <Text style={styles.numberLabel}>الْقِيمَة</Text>
              <Text style={styles.numberLabelEn}>TOTAL</Text>
              <Text style={[styles.numberValue, { color: Colors.gold }]}>
                {result.totalValue.toLocaleString()}
              </Text>
            </View>
            <View style={styles.numberBox}>
              <Text style={styles.numberLabel}>الرَّقْمُ</Text>
              <Text style={styles.numberLabelEn}>REDUCED</Text>
              <Text style={[styles.numberValue, { color: Colors.accent }]}>
                {result.reducedNumber}
              </Text>
            </View>
            <View style={styles.numberBox}>
              <Text style={styles.numberLabel}>الرُّوحَانِيّ</Text>
              <Text style={styles.numberLabelEn}>SPIRITUAL</Text>
              <Text style={[styles.numberValue, { color: Colors.secondary }]}>
                {result.spiritualNumber}
              </Text>
            </View>
          </View>

          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>تَحْلِيلُ الْحُرُوفِ</Text>
            <Text style={styles.breakdownTitleEn}>LETTER BREAKDOWN</Text>
            <View style={styles.breakdownGrid}>
              {result.letterBreakdown.map((item, index) => (
                <View key={index} style={styles.breakdownRow}>
                  <Text style={styles.breakdownLetter}>{item.letter}</Text>
                  <Text style={styles.breakdownEquals}>=</Text>
                  <Text style={styles.breakdownValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>﴾ تَحْلِيلُ اسْمٍ آخَرَ ﴿</Text>
            <Text style={styles.backButtonLatin}>ANALYZE ANOTHER NAME</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </Text>
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
  },
  headerOrnament: {
    marginTop: Spacing.two,
    alignItems: 'center',
  },
  ornamentSymbol: {
    fontSize: 36,
    color: Colors.gold,
    opacity: 0.5,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.gold,
    textAlign: 'center',
    marginTop: Spacing.two,
  },
  screenSubtitle: {
    fontSize: 10,
    color: Colors.goldLight,
    letterSpacing: 2,
    textAlign: 'center',
    opacity: 0.6,
    marginBottom: Spacing.four,
  },
  nameCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.darkGreenLight,
    borderRadius: 20,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    marginBottom: Spacing.three,
  },
  nameLabel: {
    fontSize: 12,
    color: Colors.goldLight,
    textAlign: 'center',
    opacity: 0.6,
    letterSpacing: 1,
    marginBottom: Spacing.one,
  },
  nameValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.gold,
    textAlign: 'center',
  },
  motherLabel: {
    fontSize: 12,
    color: Colors.goldLight,
    textAlign: 'center',
    opacity: 0.5,
    marginTop: Spacing.three,
  },
  motherValue: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.goldLight,
    textAlign: 'center',
  },
  elementCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: Spacing.four,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: Spacing.three,
  },
  elementIcon: {
    fontSize: 36,
    marginBottom: Spacing.two,
  },
  elementTitle: {
    fontSize: 12,
    color: Colors.goldLight,
    opacity: 0.6,
    letterSpacing: 1,
  },
  elementName: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.gold,
    marginVertical: Spacing.one,
  },
  elementDescAr: {
    fontSize: 14,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
  },
  elementDescEn: {
    fontSize: 11,
    color: Colors.goldLight,
    textAlign: 'center',
    opacity: 0.5,
    marginTop: Spacing.one,
    lineHeight: 16,
  },
  numbersRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    width: '100%',
    maxWidth: 400,
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  numberBox: {
    flex: 1,
    backgroundColor: Colors.darkGreenLight,
    borderRadius: 16,
    padding: Spacing.three,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  numberLabel: {
    fontSize: 11,
    color: Colors.goldLight,
    opacity: 0.6,
  },
  numberLabelEn: {
    fontSize: 8,
    color: Colors.goldLight,
    opacity: 0.4,
    letterSpacing: 1,
  },
  numberValue: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: Spacing.one,
  },
  breakdownCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: Spacing.three,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gold,
    textAlign: 'center',
  },
  breakdownTitleEn: {
    fontSize: 9,
    color: Colors.goldLight,
    textAlign: 'center',
    opacity: 0.5,
    letterSpacing: 1,
    marginBottom: Spacing.three,
  },
  breakdownGrid: {
    gap: Spacing.one,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  breakdownLetter: {
    fontSize: 22,
    color: Colors.white,
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'center',
  },
  breakdownEquals: {
    fontSize: 16,
    color: Colors.goldLight,
    opacity: 0.5,
  },
  breakdownValue: {
    fontSize: 18,
    color: Colors.accent,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
  },
  backButton: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.gold,
    borderRadius: 14,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: Spacing.two,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.darkGreen,
  },
  backButtonLatin: {
    fontSize: 9,
    color: Colors.darkGreen,
    letterSpacing: 1,
    marginTop: 2,
    opacity: 0.7,
  },
  footer: {
    marginTop: Spacing.four,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.goldLight,
    textAlign: 'center',
    opacity: 0.4,
  },
  errorText: {
    fontSize: 18,
    color: Colors.gold,
    textAlign: 'center',
    marginTop: Spacing.six,
  },
});
