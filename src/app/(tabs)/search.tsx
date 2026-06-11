import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  I18nManager,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { searchQuranByAbjad, type VerseMatch } from '@/hooks/use-quran-search';
import { loadAllVerses, searchQuranByText } from '@/hooks/use-quran-text-search';
import { searchNamesByValue, searchNamesByCombination, type NameMatch, type NameCombo } from '@/hooks/use-names-of-allah';
import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';

const isRTL = I18nManager.isRTL;

type SearchMode = 'value' | 'ayat';

export default function SearchScreen() {
  const theme = useTheme();
  const isDark = theme.background === '#0A1628';

  const [mode, setMode] = useState<SearchMode>('value');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VerseMatch[]>([]);
  const [namesResults, setNamesResults] = useState<NameMatch[]>([]);
  const [nameComboResult, setNameComboResult] = useState<NameCombo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (q: string, m: SearchMode) => {
    if (!q.trim()) {
      setResults([]);
      setNamesResults([]);
      setNameComboResult(null);
      setSearched(false);
      return;
    }
    setResults([]);
    setNamesResults([]);
    setNameComboResult(null);
    setLoading(true);
    setSearched(true);
    try {
      const val = Number(q.trim());
      if (m === 'value') {
        const [verses, names] = await Promise.all([
          searchQuranByAbjad(val),
          searchNamesByValue(val),
        ]);
        setResults(verses);
        setNamesResults(names);
        if (verses.length === 0 && names.length === 0) {
          const combo = await searchNamesByCombination(val);
          setNameComboResult(combo);
        }
      } else {
        setResults(await searchQuranByText(q.trim()));
      }
    } catch {
      setResults([]);
      setNamesResults([]);
      setNameComboResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllVerses();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      runSearch(query, mode);
    }, mode === 'ayat' ? 100 : 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, mode, runSearch]);

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.topAccent, { backgroundColor: isDark ? 'rgba(75,184,250,0.03)' : 'rgba(212,175,55,0.04)' }]} />

      <SafeAreaView style={styles.headerContainer} edges={['top']}>
        <SectionHeader
          titleAr="الْبَحْثُ فِي الْقُرْآنِ"
          titleEn="QURAN SEARCH"
          style={styles.header}
          compact
        />
      </SafeAreaView>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card variant="glass" style={styles.searchCard}>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[
                styles.segment,
                mode === 'value' && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.7)', borderColor: Colors.gold },
              ]}
              onPress={() => { setMode('value'); setResults([]); setSearched(false); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.segmentText, { color: theme.text }, mode === 'value' && styles.segmentTextActive]}>بِالْقِيمَة</Text>
              <Text style={[styles.segmentSub, mode === 'value' && { opacity: 0.5 }]}>VALUE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segment,
                mode === 'ayat' && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.7)', borderColor: Colors.gold },
              ]}
              onPress={() => { setMode('ayat'); setResults([]); setSearched(false); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.segmentText, { color: theme.text }, mode === 'ayat' && styles.segmentTextActive]}>بِالْآيَة</Text>
              <Text style={[styles.segmentSub, mode === 'ayat' && { opacity: 0.5 }]}>TEXT</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: theme.text }]}
            value={query}
            onChangeText={setQuery}
            placeholder={mode === 'value' ? "مَثَلًا: ١١٠" : "مَثَلًا: رَحْمَة"}
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'}
            textAlign={isRTL ? 'right' : 'left'}
            keyboardType={mode === 'value' ? 'number-pad' : 'default'}
            autoCorrect={false}
            returnKeyType="search"
          />
        </Card>

        {loading && (
          <View style={styles.statusState}>
            <ActivityIndicator size="small" color={Colors.accent} />
            <Text style={[styles.statusText, { color: theme.textSecondary }]}>جَارِي الْبَحْثُ ...</Text>
          </View>
        )}

        {!loading && searched && results.length === 0 && namesResults.length === 0 && !nameComboResult && (
          <View style={styles.statusState}>
            <Text style={styles.statusIcon}>﴿</Text>
            <Text style={[styles.statusText, { color: theme.textSecondary }]}>لَا نَتَائِج</Text>
            <Text style={styles.statusSub}>No results</Text>
          </View>
        )}

        {!loading && mode === 'value' && namesResults.length > 0 && (
          <Card variant="elevated" style={styles.resultsCard}>
            <Text style={styles.resultsTitleAr}>أَسْمَاءُ اللَّهِ الْحُسْنَى</Text>
            <Text style={styles.resultsTitleEn}>NAMES OF ALLAH • {namesResults.length}</Text>
            <View style={styles.namesGrid}>
              {namesResults.map((n, i) => (
                <View key={n.name} style={[styles.nameItem, i > 0 && styles.itemBorder]}>
                  <Text style={[styles.nameText, { color: theme.text }]}>{n.name}</Text>
                  <View style={styles.nameValueRow}>
                    <Text style={styles.nameValueLabel}>الْقِيمَة</Text>
                    <Text style={styles.nameValue}>{n.totalValue}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        )}

        {!loading && nameComboResult && (
          <Card variant="elevated" style={styles.resultsCard}>
            <Text style={styles.resultsTitleAr}>أَسْمَاءُ اللَّهِ الْحُسْنَى</Text>
            <Text style={styles.resultsTitleEn}>COMBINATION • {nameComboResult.count} NAMES</Text>
            <View style={styles.namesGrid}>
              {nameComboResult.names.map((name, i) => (
                <View key={name} style={[styles.nameItem, i > 0 && styles.itemBorder]}>
                  <Text style={[styles.nameText, { color: theme.text }]}>{name}</Text>
                  {i < nameComboResult.names.length - 1 && (
                    <Text style={[styles.plusSign, { color: Colors.gold }]}>+</Text>
                  )}
                </View>
              ))}
              <View style={[styles.nameItem, styles.itemBorder]}>
                <Text style={[styles.nameText, { color: Colors.gold }]}>المجموع</Text>
                <Text style={[styles.nameValue, { color: Colors.gold, fontSize: 20 }]}>{nameComboResult.totalValue}</Text>
              </View>
            </View>
          </Card>
        )}

        {!loading && results.length > 0 && (
          <Card variant="glass" style={styles.resultsCard}>
            <Text style={styles.resultsTitleAr}>الْآيَاتُ الْقُرْآنِيَّة</Text>
            <Text style={styles.resultsTitleEn}>VERSES • {results.length}</Text>
            <View style={styles.versesList}>
              {results.map((v, i) => (
                <View key={`${v.surah}-${v.verse}`} style={[styles.verseItem, i > 0 && styles.itemBorder]}>
                  <Text style={[styles.verseText, { color: theme.text }]}>{v.text}</Text>
                  <Text style={[styles.verseRef, { color: Colors.accent }]}>
                    {v.surahName} • {v.surah}:{v.verse}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
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
  searchCard: {
    gap: Spacing.three,
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  segment: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
    opacity: 0.45,
  },
  segmentTextActive: {
    opacity: 1,
  },
  segmentSub: {
    fontSize: 8,
    letterSpacing: 1.5,
    opacity: 0.25,
    color: Colors.accent,
    marginTop: 2,
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 18,
    fontWeight: '600',
  },
  statusState: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
    gap: Spacing.two,
  },
  statusIcon: {
    fontSize: 32,
    color: Colors.gold,
    opacity: 0.15,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusSub: {
    fontSize: 9,
    opacity: 0.3,
    letterSpacing: 1,
  },
  resultsCard: {
    padding: Spacing.four,
  },
  resultsTitleAr: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gold,
    textAlign: isRTL ? 'right' : 'left',
  },
  resultsTitleEn: {
    fontSize: 8,
    letterSpacing: 1.5,
    opacity: 0.4,
    marginBottom: Spacing.three,
    textAlign: isRTL ? 'right' : 'left',
  },
  namesGrid: {
    gap: Spacing.two,
  },
  nameItem: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '700',
  },
  nameValueRow: {
    alignItems: 'center',
    gap: 1,
  },
  nameValueLabel: {
    fontSize: 7,
    letterSpacing: 0.5,
    opacity: 0.35,
    color: Colors.gold,
  },
  nameValue: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.gold,
  },
  plusSign: {
    fontSize: 18,
    fontWeight: '700',
    opacity: 0.5,
  },
  versesList: {
    gap: Spacing.four,
  },
  verseItem: {
    gap: Spacing.two,
  },
  itemBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
    paddingTop: Spacing.three,
  },
  verseText: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'right',
  },
  verseRef: {
    fontSize: 10,
    fontWeight: '700',
  },
});
