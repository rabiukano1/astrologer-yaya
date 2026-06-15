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
import { useLocale } from '@/hooks/locale-context';

import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
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

export default function RelationshipScreen() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.background === '#0A1628';
  const { t, isRTL } = useLocale();
  const handleBack = useCallback(() => router.back(), [router]);
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [res, setRes] = useState<number | null>(null);

  const calc = () => {
    if (!p1.trim() || !p2.trim()) return;
    const latin = (c: string) => c.toUpperCase().charCodeAt(0) - 64;
    const val = (c: string) => abjad[c] ?? (/[A-Za-z]/.test(c) ? latin(c) : 0);
    const sum = (s: string) => [...s.replace(/[\s\-]/g, '').replace(/[\u064B-\u065F\u0670]/g, '')]
      .reduce((t, c) => t + val(c), 0);
    const total = sum(p1.trim()) + sum(p2.trim()) + 7;
    const r = total % 9;
    setRes(r === 0 ? 9 : r);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.topAccent, { backgroundColor: isDark ? 'rgba(255,107,138,0.03)' : 'rgba(255,107,138,0.04)' }]} />

      <SafeAreaView style={styles.safeHeader} edges={['top']}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
        >
          <Text style={styles.backBtnArrow}>←</Text>
        </Pressable>
        <SectionHeader title={t('relationshipNumberTitle')} />
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
            value={p1}
            onChangeText={(t) => { setP1(t); setRes(null); }}
            placeholder="مَثَلًا: مُحَمَّد"
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'}
            textAlign={isRTL ? 'right' : 'left'}
            autoCorrect={false}
          />

          <Text style={[styles.label, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>{t('person2')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: theme.text }]}
            value={p2}
            onChangeText={(t) => { setP2(t); setRes(null); }}
            placeholder="مَثَلًا: مَرْيَم"
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'}
            textAlign={isRTL ? 'right' : 'left'}
            autoCorrect={false}
          />

          <Button
            title={t('calculate')}
            variant="gold"
            onPress={calc}
            disabled={!p1.trim() || !p2.trim()}
            style={styles.calcBtn}
          />

          {res !== null && (
            <View style={[styles.resultBox, { backgroundColor: isDark ? 'rgba(255,107,138,0.1)' : 'rgba(255,107,138,0.08)' }]}>
              <Text style={styles.resLabel}>{t('relationshipNumberTitle')}</Text>
              <Text style={[styles.resNum, { color: '#FF6B8A' }]}>{res}</Text>
            </View>
          )}
        </Card>

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
  headerContainer: {
    alignItems: 'center',
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
  resultBox: {
    marginTop: Spacing.three,
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: 14,
  },
  resLabel: {
    fontSize: 9,
    letterSpacing: 1,
    color: Colors.accent,
    fontWeight: '600',
    marginBottom: Spacing.one,
  },
  resNum: {
    fontSize: 42,
    fontWeight: '900',
    marginVertical: Spacing.one,
  },
});
