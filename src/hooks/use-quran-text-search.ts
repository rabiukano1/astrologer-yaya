import type { VerseMatch } from './use-quran-search';
import { searchVersesByText, initializeDatabase } from '@/services/quran-database';

export async function loadAllVerses(): Promise<VerseMatch[]> {
  await initializeDatabase();
  return [];
}

export async function searchQuranByText(query: string): Promise<VerseMatch[]> {
  const rows = await searchVersesByText(query, 50);
  return rows.map(r => ({
    surah: r.surah_id,
    surahName: r.surah_name,
    verse: r.verse_number,
    text: r.verse_text,
  }));
}
