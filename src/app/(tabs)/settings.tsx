import { useCallback } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SymbolView } from 'expo-symbols';

import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useThemeContext } from '@/hooks/theme-context';
import { useLocale } from '@/hooks/locale-context';
import { Card } from '@/components/ui/card';
import { type Locale } from '@/constants/translations';

const APP_VERSION = '1.0.0';

const LOCALES: { key: Locale; label: string; flag: string }[] = [
  { key: 'ar', label: 'العربية', flag: '🇸🇦' },
  { key: 'en', label: 'English', flag: '🇬🇧' },
  { key: 'ha', label: 'Hausa', flag: '🇳🇬' },
];

const RESOURCES = [
  {
    icon: 'square.and.arrow.up',
    key: 'shareApp',
    tint: Colors.accent,
    action: () => Share.share({ message: 'أَسْتْرُولُوجَرْ يَايَا - حِسَابُ الْجُمَّلِ وَتَحْلِيلُ الْأَسْمَاءِ' }),
  },
  {
    icon: 'star',
    key: 'rateApp',
    tint: Colors.gold,
    action: () => Linking.openURL('https://example.com/rate'),
  },
  {
    icon: 'envelope',
    key: 'contactUs',
    tint: '#4BB8FA',
    action: () => Linking.openURL('mailto:contact@astrologeryaya.com'),
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.background === '#0A1628';
  const { t, isRTL } = useLocale();

  const handleBack = useCallback(() => router.back(), [router]);

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.bgGlow, { backgroundColor: isDark ? 'rgba(75,184,250,0.03)' : 'rgba(212,175,55,0.04)' }]} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.5 }]}
          >
            <SymbolView name="chevron.left" size={18} weight="semibold" tintColor={Colors.accent} />
          </Pressable>
          <View style={styles.headerTitle}>
            <Text style={[styles.headerText, { color: theme.text }]}>{t('settingsTitle')}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Appearance Section */}
          <AnimatedSection index={0} isRTL={isRTL}>
            <SectionTitle title={t('appearance')} isRTL={isRTL} />
            <Card variant="glass" style={styles.sectionCard}>
              <DarkModeToggle isRTL={isRTL} />
            </Card>
          </AnimatedSection>

          {/* Language Section */}
          <AnimatedSection index={1} isRTL={isRTL}>
            <SectionTitle title={t('language')} isRTL={isRTL} />
            <Card variant="glass" style={styles.sectionCard}>
              <LanguageSelector isRTL={isRTL} />
            </Card>
          </AnimatedSection>

          {/* About Section */}
          <AnimatedSection index={2} isRTL={isRTL}>
            <SectionTitle title={t('aboutApp')} isRTL={isRTL} />
            <Card variant="glass" style={styles.aboutCard}>
              <View style={[styles.appIconRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.appIconBox, { backgroundColor: Colors.gold + '18' }]}>
                  <Text style={styles.appIconText}>﴿</Text>
                </View>
                <View style={styles.appNameCol}>
                  <Text style={[styles.appName, { color: theme.text }]}>{t('appName')}</Text>
                </View>
              </View>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <Text style={[styles.aboutDesc, { color: theme.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('appDescription')}
              </Text>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <View style={[styles.creditRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.creditLabel, { color: theme.textSecondary }]}>{t('developer')}</Text>
                <Text style={[styles.creditValue, { color: theme.text }]}>MUHAMMAD RABIU MUSA</Text>
              </View>
              <View style={[styles.creditRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.creditLabel, { color: theme.textSecondary }]}>Version</Text>
                <Text style={[styles.creditValue, { color: theme.text }]}>{APP_VERSION}</Text>
              </View>
            </Card>
          </AnimatedSection>

          {/* Resources Section */}
          <AnimatedSection index={3} isRTL={isRTL}>
            <SectionTitle title={t('resources')} isRTL={isRTL} />
            <Card variant="glass" style={styles.sectionCard}>
              {RESOURCES.map((r, i) => (
                <ResourceRow key={r.key} resource={r} isFirst={i === 0} isRTL={isRTL} />
              ))}
            </Card>
          </AnimatedSection>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={[styles.footerDivider, { backgroundColor: theme.border }]} />
            <Text style={[styles.footerVerse, { color: Colors.gold }]}>
              ﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾
            </Text>
            <Text style={[styles.footerVerseRef, { color: theme.textSecondary }]}>
              طه • 20:114
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function AnimatedSection({ index, children, isRTL }: { index: number; children: React.ReactNode; isRTL: boolean }) {
  return (
    <Animated.View entering={FadeInDown.delay(150 + index * 100).springify().damping(20)}>
      {children}
    </Animated.View>
  );
}

function SectionTitle({ title, isRTL }: { title: string; isRTL: boolean }) {
  const theme = useTheme();
  return (
    <View style={[styles.sectionTitleRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <View style={[styles.sectionAccent, { backgroundColor: Colors.gold }]} />
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
    </View>
  );
}

function DarkModeToggle({ isRTL }: { isRTL: boolean }) {
  const theme = useTheme();
  const isDark = theme.background === '#0A1628';
  const { userTheme, setUserTheme } = useThemeContext();
  const { t } = useLocale();
  const enabled = userTheme === 'dark';

  const toggle = () => setUserTheme(enabled ? 'light' : 'dark');

  return (
    <Pressable
      onPress={toggle}
      style={({ pressed }) => [
        styles.darkModeRow,
        { flexDirection: isRTL ? 'row-reverse' : 'row' },
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={[styles.darkModeIconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
        <SymbolView
          name={enabled ? 'moon.stars.fill' : 'sun.max.fill'}
          size={20}
          weight="semibold"
          tintColor={enabled ? '#4BB8FA' : Colors.gold}
        />
      </View>
      <Text style={[styles.darkModeLabel, { color: theme.text }]}>
        {enabled ? t('darkMode') : t('lightMode')}
      </Text>
      <Switch
        value={enabled}
        onValueChange={toggle}
        trackColor={{ false: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)', true: Colors.primary + '80' }}
        thumbColor={enabled ? Colors.accent : theme.textSecondary}
        ios_backgroundColor={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}
      />
    </Pressable>
  );
}

function LanguageSelector({ isRTL }: { isRTL: boolean }) {
  const theme = useTheme();
  const { locale, setLocale, t } = useLocale();

  return (
    <View style={styles.langWrap}>
      {LOCALES.map((l) => {
        const active = locale === l.key;
        return (
          <Pressable
            key={l.key}
            onPress={() => setLocale(l.key)}
            style={({ pressed }) => [
              styles.langOption,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
              active && {
                backgroundColor: (theme.background === '#0A1628' ? 'rgba(75,184,250,0.15)' : 'rgba(75,184,250,0.1)'),
                borderColor: Colors.accent,
              },
              !active && {
                borderColor: theme.border,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.langFlag}>{l.flag}</Text>
            <Text style={[styles.langLabel, active && { color: Colors.accent, fontWeight: '700' }, !active && { color: theme.text }]}>
              {l.label}
            </Text>
            {active && (
              <SymbolView
                name="checkmark.circle.fill"
                size={18}
                weight="medium"
                tintColor={Colors.accent}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

function ResourceRow({ resource, isFirst, isRTL }: { resource: typeof RESOURCES[number]; isFirst: boolean; isRTL: boolean }) {
  const theme = useTheme();
  const { t } = useLocale();

  return (
    <Pressable
      onPress={resource.action}
      style={({ pressed }) => [
        styles.resourceRow,
        { flexDirection: isRTL ? 'row-reverse' : 'row' },
        isFirst && { marginTop: 0 },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={[styles.resourceIconBox, { backgroundColor: resource.tint + '15' }]}>
        <SymbolView
          name={resource.icon as any}
          size={18}
          weight="medium"
          tintColor={resource.tint}
        />
      </View>
      <Text style={[styles.resourceLabel, { color: theme.text }]}>{t(resource.key)}</Text>
      <SymbolView
        name="chevron.right"
        size={14}
        weight="medium"
        tintColor={theme.textSecondary}
        style={{ opacity: 0.4 }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bgGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  safe: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },

  // Section
  sectionTitleRow: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sectionAccent: {
    width: 3,
    height: 28,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Cards
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
  },

  // Dark mode toggle
  darkModeRow: {
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: Spacing.four,
  },
  darkModeIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkModeLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },

  // Language selector
  langWrap: {
    gap: 1,
    paddingVertical: 6,
    paddingHorizontal: Spacing.three,
  },
  langOption: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 3,
  },
  langFlag: {
    fontSize: 22,
  },
  langLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },

  // About card
  aboutCard: {
    padding: Spacing.four,
  },
  appIconRow: {
    alignItems: 'center',
    gap: 16,
  },
  appIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIconText: {
    fontSize: 22,
    color: Colors.gold,
    fontWeight: '700',
  },
  appNameCol: {
    flex: 1,
    gap: 2,
  },
  appName: {
    fontSize: 17,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  aboutDesc: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 22,
  },
  creditRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  creditLabel: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.5,
  },
  creditValue: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Resource rows
  resourceRow: {
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: Spacing.four,
    marginTop: 1,
  },
  resourceIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 32,
    gap: 8,
  },
  footerDivider: {
    width: 40,
    height: 1,
    marginBottom: 12,
  },
  footerVerse: {
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.5,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  footerVerseRef: {
    fontSize: 9,
    opacity: 0.3,
    fontWeight: '600',
  },
});
