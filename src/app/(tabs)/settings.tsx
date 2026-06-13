import { useCallback } from 'react';
import {
  I18nManager,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useThemeContext, type ThemeMode } from '@/hooks/theme-context';
import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';

const isRTL = I18nManager.isRTL;

const themeOptions: { mode: ThemeMode; label: string; labelAr: string; icon: string }[] = [
  { mode: 'system', label: 'System', labelAr: 'النِّظَام', icon: '◉' },
  { mode: 'light', label: 'Light', labelAr: 'فَاتِح', icon: '○' },
  { mode: 'dark', label: 'Dark', labelAr: 'دَاكِن', icon: '●' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.background === '#0A1628';
  const handleBack = useCallback(() => router.back(), [router]);

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.topAccent, { backgroundColor: isDark ? 'rgba(75,184,250,0.03)' : 'rgba(212,175,55,0.04)' }]} />

      <SafeAreaView style={styles.headerContainer} edges={['top']}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
        >
          <Text style={styles.backBtnArrow}>←</Text>
        </Pressable>
        <SectionHeader
          titleAr="الإِعْدَادَات"
          titleEn="SETTINGS"
          style={styles.header}
          compact
        />
      </SafeAreaView>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="glass" style={styles.card}>
          <Text style={styles.cardTitleAr}>المَظْهَر</Text>
          <Text style={styles.cardTitleEn}>APPEARANCE</Text>

          <View style={styles.optionsContainer}>
            <ThemeOption
              mode="system"
              labelAr="النِّظَام"
              label="System"
              icon="◉"
            />
            <ThemeOption
              mode="light"
              labelAr="فَاتِح"
              label="Light"
              icon="○"
            />
            <ThemeOption
              mode="dark"
              labelAr="دَاكِن"
              label="Dark"
              icon="●"
            />
          </View>
        </Card>

        <Card variant="solid" style={styles.infoCard}>
          <Text style={[styles.infoTitle, { color: Colors.gold }]}>﴿</Text>
          <Text style={[styles.infoText, { color: theme.text }]}>
            اختر الوضع الذي يناسبك. الوضع الداكن مريح للعين في الإضاءة المنخفضة.
          </Text>
          <Text style={[styles.infoTextEn, { color: theme.textSecondary }]}>
            Choose the mode that suits you. Dark mode is easier on the eyes in low light.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

function ThemeOption({ mode, labelAr, label, icon }: { mode: ThemeMode; labelAr: string; label: string; icon: string }) {
  const theme = useTheme();
  const isDark = theme.background === '#0A1628';
  const { userTheme, setUserTheme } = useThemeContext();
  const isActive = userTheme === mode;

  return (
    <TouchableOpacity
      style={[
        styles.optionRow,
        { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' },
        isActive && { backgroundColor: Colors.primary },
      ]}
      onPress={() => setUserTheme(mode)}
      activeOpacity={0.7}
    >
      <View style={[styles.optionIconBox, isActive && { opacity: 1 }]}>
        <Text style={[styles.optionIcon, !isActive && { opacity: 0.3 }]}>{icon}</Text>
      </View>
      <View style={styles.optionContent}>
        <Text style={[styles.optionLabel, { color: theme.text }, isActive && { color: Colors.white }]}>
          {labelAr}
        </Text>
        <Text style={[styles.optionLabelEn, { color: theme.textSecondary }, isActive && { color: Colors.lightBlue }]}>
          {label}
        </Text>
      </View>
      {isActive && (
        <View style={styles.checkCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
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
  card: {
    padding: Spacing.four,
  },
  cardTitleAr: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gold,
    textAlign: isRTL ? 'right' : 'left',
  },
  cardTitleEn: {
    fontSize: 8,
    letterSpacing: 1.5,
    opacity: 0.4,
    marginBottom: Spacing.four,
    textAlign: isRTL ? 'right' : 'left',
  },
  optionsContainer: {
    gap: Spacing.two,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 14,
  },
  optionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIcon: {
    fontSize: 16,
    color: Colors.accent,
  },
  optionContent: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  optionLabelEn: {
    fontSize: 9,
    opacity: 0.4,
    letterSpacing: 1,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '900',
  },
  infoCard: {
    padding: Spacing.four,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 20,
    opacity: 0.3,
    marginBottom: Spacing.two,
  },
  infoText: {
    fontSize: 13,
    opacity: 0.8,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  infoTextEn: {
    fontSize: 11,
    opacity: 0.5,
    textAlign: 'center',
    lineHeight: 17,
  },
});
