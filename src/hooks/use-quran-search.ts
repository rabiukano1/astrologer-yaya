import { searchVersesByAbjad } from '@/services/quran-database';

export interface VerseMatch {
  surah: number;
  surahName: string;
  verse: number;
  text: string;
}

export async function searchQuranByAbjad(totalValue: number): Promise<VerseMatch[]> {
  const rows = await searchVersesByAbjad(totalValue);
  return rows.map(r => ({
    surah: r.surah_id,
    surahName: r.surah_name,
    verse: r.verse_number,
    text: r.verse_text,
  }));
}
