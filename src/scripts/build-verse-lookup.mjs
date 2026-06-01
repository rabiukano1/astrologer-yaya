// Generates public/quran-verses.json — a lookup of abjad values -> [surah, name, verse, text]
// Run: node src/scripts/build-verse-lookup.mjs

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const surahDir = join(root, 'surah');

const abjadMap = {
  '\u0627': 1, '\u0623': 1, '\u0625': 1, '\u0622': 1, '\u0628': 2,
  '\u062C': 3, '\u062F': 4, '\u0647': 5, '\u0629': 5, '\u0648': 6,
  '\u0632': 7, '\u062D': 8, '\u0637': 9, '\u064A': 10, '\u0649': 10,
  '\u0643': 20, '\u0644': 30, '\u0645': 40, '\u0646': 50, '\u0633': 60,
  '\u0639': 70, '\u0641': 80, '\u0635': 90, '\u0642': 100, '\u0631': 200,
  '\u0634': 300, '\u062A': 400, '\u062B': 500, '\u062E': 600, '\u0630': 700,
  '\u0636': 800, '\u0638': 900, '\u063A': 1000,
};

function analyzeVerse(text) {
  const cleaned = text.replace(/[\s\-]/g, '').replace(/[\u064B-\u065F\u0670]/g, '');
  let total = 0;
  for (const char of cleaned) {
    const val = abjadMap[char];
    if (val) total += val;
  }
  return total;
}

const lookup = {};
for (let i = 1; i <= 114; i++) {
  const path = join(surahDir, `surah_${i}.json`);
  if (!existsSync(path)) continue;
  const data = JSON.parse(readFileSync(path, 'utf-8'));
  const surahIndex = parseInt(data.index, 10);
  const surahName = data.name.trim();
  for (const [key, verseText] of Object.entries(data.verse)) {
    const verseNum = parseInt(key.replace('verse_', ''), 10);
    if (isNaN(verseNum) || verseNum === 0) continue;
    const value = String(analyzeVerse(verseText));
    if (!lookup[value]) lookup[value] = [];
    lookup[value].push([surahIndex, surahName, verseNum, verseText]);
  }
}

writeFileSync(join(root, 'public', 'quran-verses.json'), JSON.stringify(lookup));
console.log(`Done: ${Object.keys(lookup).length} unique values`);
