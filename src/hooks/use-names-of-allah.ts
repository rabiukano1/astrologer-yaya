export interface NameMatch {
  name: string;
  totalValue: number;
  reducedNumber: number;
}

export interface NameCombo {
  names: string[];
  totalValue: number;
  count: number;
}

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

function stripAlPrefix(text: string): string {
  if (text.length < 2) return text;
  const first = text[0];
  const second = text[1];
  if ((first === 'ا' || first === 'أ' || first === 'إ') && second === 'ل') {
    return text.slice(2);
  }
  return text;
}

function calculateAbjad(text: string): number {
  return [...text].reduce((sum, char) => sum + (abjadMap[char] || 0), 0);
}

function reduceNumber(n: number): number {
  if (n === 0) return 0;
  let r = n % 9;
  return r === 0 ? 9 : r;
}

let namesCache: NameMatch[] | null = null;

export async function loadNames(): Promise<NameMatch[]> {
  if (namesCache) return namesCache;
  const res = await fetch('/names_of_allah.json');
  const raw: string[] = await res.json();
  namesCache = raw.map(name => {
    const stripped = stripAlPrefix(name);
    const totalValue = calculateAbjad(stripped);
    return { name, totalValue, reducedNumber: reduceNumber(totalValue) };
  });
  return namesCache;
}

export async function searchNamesByValue(value: number): Promise<NameMatch[]> {
  const all = await loadNames();
  return all.filter(n => n.totalValue === value || n.reducedNumber === value);
}

export async function searchNamesByCombination(value: number): Promise<NameCombo | null> {
  const all = await loadNames();
  const n = all.length;

  const valueMap = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const arr = valueMap.get(all[i].totalValue) || [];
    arr.push(i);
    valueMap.set(all[i].totalValue, arr);
  }

  // Size 2
  for (let i = 0; i < n; i++) {
    const needed = value - all[i].totalValue;
    const indices = valueMap.get(needed);
    if (!indices) continue;
    for (const j of indices) {
      if (j > i) {
        return { names: [all[i].name, all[j].name], totalValue: value, count: 2 };
      }
    }
  }

  // Size 3
  for (let i = 0; i < n; i++) {
    const remaining = value - all[i].totalValue;
    for (let j = i + 1; j < n; j++) {
      const needed = remaining - all[j].totalValue;
      const indices = valueMap.get(needed);
      if (!indices) continue;
      for (const k of indices) {
        if (k > j) {
          return { names: [all[i].name, all[j].name, all[k].name], totalValue: value, count: 3 };
        }
      }
    }
  }

  // Precompute all pair sums for sizes 4 and 5
  const pairMap = new Map<number, [number, number][]>();
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const sum = all[i].totalValue + all[j].totalValue;
      const arr = pairMap.get(sum) || [];
      arr.push([i, j]);
      pairMap.set(sum, arr);
    }
  }

  // Size 4
  for (const [sum, pairs] of pairMap) {
    const needed = value - sum;
    const complements = pairMap.get(needed);
    if (!complements) continue;
    for (const [i, j] of pairs) {
      for (const [k, l] of complements) {
        if (j < k) {
          return { names: [all[i].name, all[j].name, all[k].name, all[l].name], totalValue: value, count: 4 };
        }
      }
    }
  }

  // Size 5
  for (let i = 0; i < n; i++) {
    const remaining = value - all[i].totalValue;
    for (const [sum, pairs] of pairMap) {
      const needed = remaining - sum;
      const complements = pairMap.get(needed);
      if (!complements) continue;
      for (const [j, k] of pairs) {
        if (j <= i) continue;
        for (const [l, m] of complements) {
          if (l > k) {
            return { names: [all[i].name, all[j].name, all[k].name, all[l].name, all[m].name], totalValue: value, count: 5 };
          }
        }
      }
    }
  }

  return null;
}
