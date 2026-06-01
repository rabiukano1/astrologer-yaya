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

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { searchQuranByAbjad, type VerseMatch } from '@/hooks/use-quran-search';
import { loadAllVerses, searchQuranByText } from '@/hooks/use-quran-text-search';
import { searchNamesByValue, type NameMatch } from '@/hooks/use-names-of-allah';

const isRTL = I18nManager.isRTL;

type SearchMode = 'value' | 'ayat';

export default function SearchScreen() {
  const theme = useTheme();
  const isDark = theme.background === Colors.dark.background;

  const [mode, setMode] = useState<SearchMode>('value');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VerseMatch[]>([]);
  const [namesResults, setNamesResults] = useState<NameMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (q: string, m: SearchMode) => {
    if (!q.trim()) {
      setResults([]);
      setNamesResults([]);
      setSearched(false);
      return;
    }
    setResults([]);
    setNamesResults([]);
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
      } else {
        setResults(await searchQuranByText(q.trim()));
      }
    } catch {
      setResults([]);
      setNamesResults([]);
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
      <View style={[styles.topGradient, { backgroundColor: theme.background, borderBottomColor: isDark ? 'rgba(75,184,250,0.08)' : 'rgba(0,0,0,0.06)' }]}>
        <SafeAreaView style={styles.safeAreaTop}>
          <View style={styles.ornamentRow}>
            <View style={styles.ornamentLine} />
            <Text style={styles.ornamentSymbol}>﴿</Text>
            <View style={styles.ornamentLine} />
          </View>
          <Text style={[styles.screenTitle, { color: theme.text }]}>الْبَحْثُ فِي الْقُرْآنِ</Text>
          <View style={styles.titleUnderline} />
          <Text style={[styles.screenSubtitle, { color: theme.textSecondary }]}>Quran Search</Text>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentWrapper}>
          <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segment,
                  mode === 'value' && [styles.segmentActive, { backgroundColor: Colors.primary, borderColor: Colors.accent }],
                ]}
                onPress={() => { setMode('value'); setResults([]); setSearched(false); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.segmentText, mode === 'value' && styles.segmentTextActive]}>
                  بِالْقِيمَة
                </Text>
                <Text style={[styles.segmentSub, mode === 'value' && styles.segmentSubActive]}>
                  By Value
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segment,
                  mode === 'ayat' && [styles.segmentActive, { backgroundColor: Colors.primary, borderColor: Colors.accent }],
                ]}
                onPress={() => { setMode('ayat'); setResults([]); setSearched(false); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.segmentText, mode === 'ayat' && styles.segmentTextActive]}>
                  بِالْآيَة
                </Text>
                <Text style={[styles.segmentSub, mode === 'ayat' && styles.segmentSubActive]}>
                  By Ayat
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', color: theme.text }]}
                value={query}
                onChangeText={setQuery}
                placeholder={mode === 'value' ? 'مَثَلًا: ١٤' : 'مَثَلًا: ا ب ت'}
                placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'}
                textAlign={isRTL ? 'right' : 'left'}
                keyboardType={mode === 'value' ? 'number-pad' : 'default'}
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={() => runSearch(query, mode)}
              />
              <TouchableOpacity
                style={[styles.searchButton, { backgroundColor: Colors.gold }]}
                onPress={() => runSearch(query, mode)}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.darkGreen} />
                ) : (
                  <Text style={styles.searchButtonText}>﴾ بَحْث ﴿</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {loading && (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={Colors.accent} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>جَارِي الْبَحْثُ ...</Text>
              <Text style={[styles.loadingTextEn, { color: theme.textSecondary }]}>Searching...</Text>
            </View>
          )}

          {!loading && searched && results.length === 0 && namesResults.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>﴿</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>لَا نَتَائِج</Text>
              <Text style={[styles.emptyTextEn, { color: theme.textSecondary }]}>No results found</Text>
            </View>
          )}

          {!loading && mode === 'value' && namesResults.length > 0 && (
            <View style={[styles.resultsCard, { backgroundColor: theme.backgroundElement }]}>
              <View style={styles.resultsHeader}>
                <Text style={[styles.resultsCount, { color: Colors.gold }]}>
                  أَسْمَاءُ اللَّهِ
                </Text>
                <Text style={[styles.resultsCountEn, { color: theme.textSecondary }]}>
                  {namesResults.length} Name{namesResults.length !== 1 ? 's' : ''} of Allah
                </Text>
              </View>
              {namesResults.map((n, i) => (
                <View
                  key={n.name}
                  style={[
                    styles.nameRow,
                    i < namesResults.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)' },
                  ]}
                >
                  <Text style={[styles.nameText, { color: theme.text }]}>{n.name}</Text>
                  <Text style={[styles.verseRef, { color: theme.textSecondary }]}>
                    الْقِيمَة: {n.totalValue.toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {!loading && results.length > 0 && (
            <View style={[styles.resultsCard, { backgroundColor: theme.backgroundElement }]}>
              <View style={styles.resultsHeader}>
                <Text style={[styles.resultsCount, { color: Colors.accent }]}>
                  {results.length} {mode === 'value' ? 'آيَة' : 'نَتِيجَة'}
                </Text>
                <Text style={[styles.resultsCountEn, { color: theme.textSecondary }]}>
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </Text>
              </View>
              {results.map((v, i) => (
                <View
                  key={`${v.surah}-${v.verse}`}
                  style={[
                    styles.verseRow,
                    i < results.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)' },
                  ]}
                >
                  <Text style={[styles.verseRef, { color: theme.textSecondary }]}>
                    {v.surahName} #{v.surah}:{v.verse}
                  </Text>
                  <Text style={[styles.verseText, { color: theme.text }]}>{v.text}</Text>
                </View>
              ))}
            </View>
          )}
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
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
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
    textAlign: 'center',
    letterSpacing: 3,
    marginTop: Spacing.one,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.six,
  },
  contentWrapper: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.three,
    maxWidth: MaxContentWidth + Spacing.five * 2,
    alignSelf: 'center',
    width: '100%',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(75,184,250,0.12)',
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  segment: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(75,184,250,0.1)',
  },
  segmentActive: {
    borderWidth: 1,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.lightBlue,
    opacity: 0.6,
  },
  segmentTextActive: {
    color: Colors.white,
    opacity: 1,
  },
  segmentSub: {
    fontSize: 8,
    color: Colors.lightBlue,
    opacity: 0.4,
    letterSpacing: 1,
    marginTop: 2,
  },
  segmentSubActive: {
    color: Colors.white,
    opacity: 0.7,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: 14,
    padding: Spacing.three,
    fontSize: 18,
    borderWidth: 1,
    borderColor: 'rgba(75,184,250,0.1)',
  },
  searchButton: {
    borderRadius: 14,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.darkGreen,
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.two,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.3,
  },
  loadingTextEn: {
    fontSize: 9,
    opacity: 0.2,
    letterSpacing: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.two,
  },
  emptyIcon: {
    fontSize: 40,
    color: Colors.lightBlue,
    opacity: 0.15,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.3,
  },
  emptyTextEn: {
    fontSize: 9,
    opacity: 0.2,
    letterSpacing: 1,
  },
  resultsCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(75,184,250,0.15)',
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  resultsCountEn: {
    fontSize: 8,
    opacity: 0.4,
    letterSpacing: 1,
    marginTop: 2,
  },
  nameRow: {
    paddingVertical: Spacing.three,
    gap: Spacing.half,
    alignItems: 'center',
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  verseRow: {
    paddingVertical: Spacing.two,
    gap: Spacing.one,
  },
  verseRef: {
    fontSize: 9,
    fontWeight: '600',
    opacity: 0.5,
    letterSpacing: 0.5,
  },
  verseText: {
    fontSize: 15,
    textAlign: 'right',
    lineHeight: 24,
    writingDirection: 'rtl',
  },
});
