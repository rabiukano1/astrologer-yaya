import { useState } from 'react';
import {
  I18nManager,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

const isRTL = I18nManager.isRTL;

export default function HomeScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [motherName, setMotherName] = useState('');

  const handleAnalyze = () => {
    if (!fullName.trim()) return;
    router.push({
      pathname: '/analyze',
      params: { fullName: fullName.trim(), motherName: motherName.trim() },
    });
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerOrnament}>
            <Text style={styles.ornamentSymbol}>﴿</Text>
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.arabicTitle}>أَسْتْرُولُوجَرْ يَايَا</Text>
            <Text style={styles.subtitle}>ASROLOGER YAYA</Text>
            <View style={styles.divider} />
            <Text style={styles.tagline}>حِسَابُ الْجُمَّلِ وَتَحْلِيلُ الْأَسْمَاءِ</Text>
            <Text style={styles.taglineLatin}>Abjad Numerology & Name Analysis</Text>
          </View>

          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>الِاسْمُ الْكَامِل</Text>
            <Text style={styles.inputLabelLatin}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="مَثَلًا: مَرْيَم"
              placeholderTextColor="rgba(255,255,255,0.4)"
              textAlign={isRTL ? 'right' : 'left'}
              autoCorrect={false}
            />

            <Text style={[styles.inputLabel, styles.motherLabel]}>
              اسْمُ الْوَالِدَة (اخْتِيَارِي)
            </Text>
            <Text style={styles.inputLabelLatin}>Mother&apos;s Name (Optional)</Text>
            <TextInput
              style={styles.input}
              value={motherName}
              onChangeText={setMotherName}
              placeholder="مَثَلًا: حَوَّاء"
              placeholderTextColor="rgba(255,255,255,0.4)"
              textAlign={isRTL ? 'right' : 'left'}
              autoCorrect={false}
            />

            <TouchableOpacity
              style={[styles.analyzeButton, !fullName.trim() && styles.analyzeButtonDisabled]}
              onPress={handleAnalyze}
              disabled={!fullName.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.analyzeButtonText}>﴾ تَحْلِيلُ الِاسْمِ ﴿</Text>
              <Text style={styles.analyzeButtonLatin}>ANALYZE NAME</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </Text>
            <Text style={styles.footerLatin}>
              In the Name of God, the Most Gracious, the Most Merciful
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
    backgroundColor: Colors.darkGreen,
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
    marginTop: Spacing.three,
    alignItems: 'center',
  },
  ornamentSymbol: {
    fontSize: 48,
    color: Colors.gold,
    opacity: 0.6,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: Spacing.three,
    marginBottom: Spacing.five,
  },
  arabicTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.gold,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: Colors.goldLight,
    textAlign: 'center',
    letterSpacing: 3,
    marginTop: Spacing.one,
  },
  divider: {
    width: 80,
    height: 2,
    backgroundColor: Colors.gold,
    marginVertical: Spacing.three,
    opacity: 0.6,
  },
  tagline: {
    fontSize: 14,
    color: Colors.goldLight,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 2,
  },
  taglineLatin: {
    fontSize: 11,
    color: Colors.goldLight,
    textAlign: 'center',
    opacity: 0.5,
    letterSpacing: 1,
  },
  inputCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.darkGreenLight,
    borderRadius: 20,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gold,
    textAlign: isRTL ? 'right' : 'left',
    marginBottom: 2,
  },
  motherLabel: {
    marginTop: Spacing.three,
  },
  inputLabelLatin: {
    fontSize: 10,
    color: Colors.goldLight,
    textAlign: isRTL ? 'right' : 'left',
    letterSpacing: 1,
    marginBottom: Spacing.two,
    opacity: 0.6,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: Spacing.three,
    fontSize: 20,
    color: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
    textAlign: 'right',
  },
  analyzeButton: {
    marginTop: Spacing.four,
    backgroundColor: Colors.gold,
    borderRadius: 14,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  analyzeButtonDisabled: {
    opacity: 0.4,
  },
  analyzeButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.darkGreen,
  },
  analyzeButtonLatin: {
    fontSize: 10,
    color: Colors.darkGreen,
    letterSpacing: 2,
    marginTop: 2,
    opacity: 0.7,
  },
  footer: {
    marginTop: Spacing.five,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: Colors.goldLight,
    textAlign: 'center',
    opacity: 0.6,
  },
  footerLatin: {
    fontSize: 10,
    color: Colors.goldLight,
    textAlign: 'center',
    opacity: 0.4,
    marginTop: Spacing.one,
  },
});
