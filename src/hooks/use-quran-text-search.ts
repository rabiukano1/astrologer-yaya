import type { VerseMatch } from './use-quran-search';

type RawEntry = [number, string, number, string];
type LookupData = Record<string, RawEntry[]>;

let allVersesCache: VerseMatch[] | null = null;

export async function loadAllVerses(): Promise<VerseMatch[]> {
  if (allVersesCache) return allVersesCache;
  const lookup: LookupData = await fetch('/quran-verses.json').then(r => r.json());
  const result: VerseMatch[] = [];
  for (const entries of Object.values(lookup)) {
    for (const [surah, surahName, verse, text] of entries) {
      result.push({ surah, surahName, verse, text });
    }
  }
  allVersesCache = result;
  return result;
}

function normalizeArabic(text: string): string {
  return text
    .replace(/[\u0640\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
    .replace(/\u0624/g, '\u0648')
    .replace(/\u0626/g, '\u064A')
    .replace(/\u0629/g, '\u0647')
    .replace(/\u0649/g, '\u064A')
    .trim();
}

export async function searchQuranByText(query: string): Promise<VerseMatch[]> {
  const q = normalizeArabic(query);
  if (!q) return [];
  const all = await loadAllVerses();
  const surahNum = Number(q);
  return all
    .filter(v => {
      if (normalizeArabic(v.text).startsWith(q)) return true;
      if (v.surahName.toLowerCase().includes(q.toLowerCase())) return true;
      if (!isNaN(surahNum) && v.surah === surahNum) return true;
      return false;
    })
    .sort((a, b) => a.surah - b.surah || a.verse - b.verse);
}
