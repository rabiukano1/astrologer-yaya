// Generates src/data/quran-all.json — flat array of all verses with normalized text
// Run: node src/scripts/build-quran-data.mjs

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const surahDir = join(root, 'surah');

function normalizeArabic(text) {
  return text
    .replace(/\u0640/g, '')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
    .replace(/\u0624/g, '\u0648')
    .replace(/\u0626/g, '\u064A')
    .replace(/\u0629/g, '\u0647')
    .replace(/\u0649/g, '\u064A')
    .trim();
}

const verses = [];
for (let i = 1; i <= 114; i++) {
  const path = join(surahDir, `surah_${i}.json`);
  if (!existsSync(path)) continue;
  const data = JSON.parse(readFileSync(path, 'utf-8'));
  const surahIndex = parseInt(data.index, 10);
  const surahName = data.name.trim();

  for (const [key, verseText] of Object.entries(data.verse)) {
    const verseNum = parseInt(key.replace('verse_', ''), 10);
    if (isNaN(verseNum) || verseNum === 0) continue;

    verses.push({
      surah_id: surahIndex,
      surah_name: surahName,
      verse_number: verseNum,
      verse_text: verseText,
    });
  }
}

const outputPath = join(root, 'src', 'data', 'quran-all.json');
writeFileSync(outputPath, JSON.stringify(verses));
console.log(`Done: ${verses.length} verses written to ${outputPath}`);
