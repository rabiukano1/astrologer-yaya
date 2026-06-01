export interface VerseMatch {
  surah: number;
  surahName: string;
  verse: number;
  text: string;
}

type RawEntry = [number, string, number, string];
type LookupData = Record<string, RawEntry[]>;

let lookupPromise: Promise<LookupData> | null = null;

function loadLookup(): Promise<LookupData> {
  if (lookupPromise) return lookupPromise;
  lookupPromise = fetch('/quran-verses.json').then(r => r.json());
  return lookupPromise;
}

export async function searchQuranByAbjad(totalValue: number): Promise<VerseMatch[]> {
  const lookup = await loadLookup();
  const key = String(totalValue);
  const matches = lookup[key];
  if (!matches) return [];
  return matches
    .map(([surah, surahName, verse, text]) => ({
      surah,
      surahName,
      verse,
      text,
    }))
    .sort((a, b) => a.surah - b.surah || a.verse - b.verse);
}
