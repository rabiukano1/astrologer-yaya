import {
  I18nManager,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useThemeContext, type ThemeMode } from '@/hooks/theme-context';

const isRTL = I18nManager.isRTL;

const themeOptions: { mode: ThemeMode; label: string; labelAr: string }[] = [
  { mode: 'system', label: 'System', labelAr: 'النِّظَام' },
  { mode: 'light', label: 'Light', labelAr: 'فَاتِح' },
  { mode: 'dark', label: 'Dark', labelAr: 'دَاكِن' },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const { userTheme, setUserTheme } = useThemeContext();

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={styles.topGradient}>
        <SafeAreaView style={styles.safeAreaTop}>
          <View style={styles.ornamentRow}>
            <View style={styles.ornamentLine} />
            <Text style={styles.ornamentSymbol}>﴿</Text>
            <View style={styles.ornamentLine} />
          </View>
          <Text style={styles.screenTitle}>الإِعْدَادَات</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.screenSubtitle}>Settings</Text>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <Text style={styles.cardTitle}>المَظْهَر</Text>
          <Text style={styles.cardSubtitle}>APPEARANCE</Text>

          <View style={styles.optionsContainer}>
            {themeOptions.map((option) => {
              const isActive = userTheme === option.mode;
              return (
                <TouchableOpacity
                  key={option.mode}
                  style={[
                    styles.optionRow,
                    isActive && { backgroundColor: Colors.primary, borderColor: Colors.accent },
                  ]}
                  onPress={() => setUserTheme(option.mode)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionLabel, isActive && { color: Colors.white }]}>
                      {option.labelAr}
                    </Text>
                    <Text style={[styles.optionLabelEn, isActive && { color: Colors.lightBlue }]}>
                      {option.label}
                    </Text>
                  </View>
                  {isActive && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme.backgroundElement }]}>
          <Text style={styles.infoText}>
            اختر الوضع الذي يناسبك. الوضع الداكن مريح للعين في الإضاءة المنخفضة.
          </Text>
          <Text style={styles.infoTextEn}>
            Choose the mode that suits you. Dark mode is easier on the eyes in low light.
          </Text>
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
    backgroundColor: 'rgba(13,27,42,0.98)',
    paddingBottom: Spacing.three,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(75,184,250,0.08)',
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
  screenTitle: {
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
  screenSubtitle: {
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
    gap: Spacing.three,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(75,184,250,0.12)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    textAlign: isRTL ? 'right' : 'left',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 9,
    color: Colors.lightBlue,
    letterSpacing: 1,
    marginBottom: Spacing.four,
    opacity: 0.4,
  },
  optionsContainer: {
    gap: Spacing.two,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  optionContent: {
    gap: 2,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  optionLabelEn: {
    fontSize: 9,
    color: Colors.lightBlue,
    opacity: 0.4,
    letterSpacing: 1,
  },
  checkMark: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '700',
  },
  infoCard: {
    width: '100%',
    borderRadius: 20,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(75,184,250,0.08)',
  },
  infoText: {
    fontSize: 13,
    color: Colors.white,
    opacity: 0.7,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  infoTextEn: {
    fontSize: 11,
    color: Colors.lightBlue,
    opacity: 0.4,
    textAlign: 'center',
    lineHeight: 18,
  },
});
