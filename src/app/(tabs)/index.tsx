import {
  I18nManager,
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
import { SectionHeader } from '@/components/ui/section-header';

const isRTL = I18nManager.isRTL;

interface Feature {
  icon: string;
  titleAr: string;
  titleEn: string;
  route: string;
  accent: string;
  bgAccent: string;
}

const features: Feature[] = [
  {
    icon: '✦',
    titleAr: 'تَحْلِيلُ الْأَسْمَاءِ',
    titleEn: 'NAME ANALYSIS',
    route: '/analyze',
    accent: Colors.gold,
    bgAccent: 'rgba(212,175,55,0.1)',
  },
  {
    icon: '♥',
    titleAr: 'رَقَمُ الْعَلَاقَة',
    titleEn: 'RELATIONSHIP NUMBER',
    route: '/relationship',
    accent: '#FF6B8A',
    bgAccent: 'rgba(255,107,138,0.1)',
  },
  {
    icon: '﴿',
    titleAr: 'الْبَحْثُ فِي الْقُرْآنِ',
    titleEn: 'QURAN SEARCH',
    route: '/search',
    accent: '#4BB8FA',
    bgAccent: 'rgba(75,184,250,0.1)',
  },
  {
    icon: '⚙',
    titleAr: 'الإِعْدَادَات',
    titleEn: 'SETTINGS',
    route: '/settings',
    accent: '#9CA3AF',
    bgAccent: 'rgba(156,163,175,0.1)',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.background === '#0A1628';

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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {features.map((f) => (
            <TouchableOpacity
              key={f.route}
              activeOpacity={0.7}
              onPress={() => router.push(f.route as any)}
              style={styles.cardWrapper}
            >
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.35)',
                    borderColor: theme.border,
                  },
                ]}
              >
                <View style={[styles.iconBox, { backgroundColor: f.bgAccent }]}>
                  <Text style={[styles.icon, { color: f.accent }]}>{f.icon}</Text>
                </View>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{f.titleAr}</Text>
                <Text style={[styles.cardTitleEn, { color: theme.textSecondary }]}>{f.titleEn}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    marginBottom: Spacing.four,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.six,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    justifyContent: 'center',
  },
  cardWrapper: {
    width: '47%',
    maxWidth: 180,
    aspectRatio: 0.95,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    padding: Spacing.four,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  icon: {
    fontSize: 28,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
  },
  cardTitleEn: {
    fontSize: 8,
    letterSpacing: 1,
    textAlign: 'center',
    opacity: 0.5,
    textTransform: 'uppercase',
  },
});
