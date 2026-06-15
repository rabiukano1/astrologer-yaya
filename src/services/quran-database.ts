import { normalizeArabic } from '@/utils/normalize-arabic';
import quranData from '@/data/quran-all.json';
import namesData from '@/data/names_of_allah.json';

let SQLite: any = null;
try {
  SQLite = require('expo-sqlite');
} catch {
  // Native module not linked (dev build needs `npx expo run:android`)
  // SQLite stays null; getDatabase() will throw a clear error when search is used
}

const DB_NAME = 'quran-v3.db';

const abjadMap: Record<string, number> = {
  ا: 1, أ: 1, إ: 1, آ: 1,
  ب: 2,
  ج: 3,
  د: 4,
  ه: 5, ة: 5,
  و: 6,
  ز: 7,
  ح: 8,
  ط: 9,
  ي: 10, ى: 10,
  ك: 20,
  ل: 30,
  م: 40,
  ن: 50,
  س: 60,
  ع: 70,
  ف: 80,
  ص: 90,
  ق: 100,
  ر: 200,
  ش: 300,
  ت: 400,
  ث: 500,
  خ: 600,
  ذ: 700,
  ض: 800,
  ظ: 900,
  غ: 1000,
};

function calculateAbjad(text: string): number {
  const cleaned = text.replace(/[\s\-]/g, '').replace(/[\u064B-\u065F\u0670]/g, '');
  let total = 0;
  for (const char of cleaned) {
    const val = abjadMap[char];
    if (val) total += val;
  }
  return total;
}

export interface VerseRow {
  id: number;
  surah_id: number;
  surah_name: string;
  verse_number: number;
  verse_text: string;
}

let dbPromise: Promise<any> | null = null;

async function getDatabase(): Promise<any> {
  if (dbPromise) return dbPromise;
  dbPromise = (async () => {
    if (!SQLite) throw new Error(
      'expo-sqlite native module is not linked. ' +
      'Run: npx expo run:android to rebuild the development app.'
    );
    const database = await SQLite.openDatabaseAsync(DB_NAME);
    await database.execAsync(`PRAGMA journal_mode = WAL`);
    await database.execAsync(`PRAGMA synchronous = NORMAL`);
    return database;
  })();
  return dbPromise;
}

async function ensureTables(database: any): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS verses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      surah_id INTEGER NOT NULL,
      surah_name TEXT NOT NULL,
      verse_number INTEGER NOT NULL,
      verse_text TEXT NOT NULL,
      normalized_text TEXT NOT NULL,
      abjad_value INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_verses_normalized ON verses(normalized_text);
    CREATE INDEX IF NOT EXISTS idx_verses_surah ON verses(surah_id);
    CREATE INDEX IF NOT EXISTS idx_verses_abjad ON verses(abjad_value);
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE TABLE IF NOT EXISTS names_of_allah (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      total_value INTEGER NOT NULL,
      reduced_number INTEGER NOT NULL
    );
  `);
}

async function isInitialized(database: any): Promise<boolean> {
  const row: { value: string } | null = await database.getFirstAsync(
    `SELECT value FROM meta WHERE key = ?`,
    ['initialized']
  );
  return row?.value === '1';
}

async function setInitialized(database: any): Promise<void> {
  await database.runAsync(
    `INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)`,
    ['initialized', '1']
  );
}

async function importVerses(database: any): Promise<void> {
  const data: { surah_id: number; surah_name: string; verse_number: number; verse_text: string }[] =
    quranData;

  const stmt = await database.prepareAsync(
    `INSERT INTO verses (surah_id, surah_name, verse_number, verse_text, normalized_text, abjad_value)
     VALUES ($surah_id, $surah_name, $verse_number, $verse_text, $normalized_text, $abjad_value)`
  );

  for (const verse of data) {
    const normalized = normalizeArabic(verse.verse_text);
    const abjadValue = calculateAbjad(verse.verse_text);
    await stmt.executeAsync({
      $surah_id: verse.surah_id,
      $surah_name: verse.surah_name,
      $verse_number: verse.verse_number,
      $verse_text: verse.verse_text,
      $normalized_text: normalized,
      $abjad_value: abjadValue,
    });
  }

  await stmt.finalizeAsync();
}

function stripAlPrefix(text: string): string {
  if (text.length < 2) return text;
  const first = text[0];
  const second = text[1];
  if ((first === 'ا' || first === 'أ' || first === 'إ') && second === 'ل') {
    return text.slice(2);
  }
  return text;
}

const namesAbjadMap: Record<string, number> = {
  ا: 1, أ: 1, إ: 1, آ: 1,
  ب: 2,
  ج: 3,
  د: 4,
  ه: 5, ة: 5,
  و: 6,
  ز: 7,
  ح: 8,
  ط: 9,
  ي: 10, ى: 10,
  ك: 20,
  ل: 30,
  م: 40,
  ن: 50,
  س: 60,
  ع: 70,
  ف: 80,
  ص: 90,
  ق: 100,
  ر: 200,
  ش: 300,
  ت: 400,
  ث: 500,
  خ: 600,
  ذ: 700,
  ض: 800,
  ظ: 900,
  غ: 1000,
};

function calculateNamesAbjad(text: string): number {
  return [...text].reduce((sum, char) => sum + (namesAbjadMap[char] || 0), 0);
}

function reduceNumber(n: number): number {
  if (n === 0) return 0;
  let r = n % 9;
  return r === 0 ? 9 : r;
}

async function importNames(database: any): Promise<void> {
  const raw: string[] = namesData;
  const stmt = await database.prepareAsync(
    `INSERT INTO names_of_allah (name, total_value, reduced_number)
     VALUES ($name, $total_value, $reduced_number)`
  );

  for (const name of raw) {
    const stripped = stripAlPrefix(name);
    const totalValue = calculateNamesAbjad(stripped);
    const reducedNumber = reduceNumber(totalValue);
    await stmt.executeAsync({
      $name: name,
      $total_value: totalValue,
      $reduced_number: reducedNumber,
    });
  }

  await stmt.finalizeAsync();
}

let initPromise: Promise<void> | null = null;

export async function initializeDatabase(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const database = await getDatabase();
    await ensureTables(database);
    const initialized = await isInitialized(database);
    if (!initialized) {
      await database.execAsync(`BEGIN TRANSACTION`);
      try {
        await importVerses(database);
        await importNames(database);
        await setInitialized(database);
        await database.execAsync(`COMMIT`);
      } catch (err) {
        await database.execAsync(`ROLLBACK`);
        initPromise = null;
        throw err;
      }
    }
  })();
  return initPromise;
}

export async function searchVersesByText(query: string, limit = 50): Promise<VerseRow[]> {
  const database = await getDatabase();
  await initializeDatabase();
  const q = normalizeArabic(query);
  if (!q) return [];
  const prefix = `${q}%`;
  const contains = `%${q}%`;
  const surahLike = `%${query.toLowerCase()}%`;
  const surahNum = Number(query) || -1;
  const rows: VerseRow[] = await database.getAllAsync(
    `SELECT id, surah_id, surah_name, verse_number, verse_text
     FROM verses
     WHERE normalized_text LIKE ?
        OR surah_name LIKE ?
        OR surah_id = ?
     ORDER BY
       CASE
         WHEN normalized_text LIKE ? THEN 0
         WHEN normalized_text LIKE ? THEN 1
         WHEN surah_name LIKE ? THEN 2
         ELSE 3
       END,
       surah_id ASC,
       verse_number ASC
     LIMIT ?`,
    [contains, surahLike, surahNum, prefix, contains, surahLike, limit]
  );
  return rows;
}

export async function searchVersesByAbjad(value: number): Promise<VerseRow[]> {
  const database = await getDatabase();
  await initializeDatabase();
  const rows: VerseRow[] = await database.getAllAsync(
    `SELECT id, surah_id, surah_name, verse_number, verse_text
     FROM verses
     WHERE abjad_value = ?
     ORDER BY surah_id ASC, verse_number ASC`,
    [value]
  );
  return rows;
}

export interface NameRow {
  name: string;
  total_value: number;
  reduced_number: number;
}

let namesCache: NameRow[] | null = null;

export async function loadAllNames(): Promise<NameRow[]> {
  if (namesCache) return namesCache;
  const database = await getDatabase();
  await initializeDatabase();
  const rows: NameRow[] = (await database.getAllAsync(
    `SELECT name, total_value, reduced_number FROM names_of_allah ORDER BY id ASC`
  )) ?? [];
  namesCache = rows;
  return rows;
}
