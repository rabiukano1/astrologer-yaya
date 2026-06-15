import { loadAllNames, type NameRow } from '@/services/quran-database';

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

let namesCache: NameMatch[] | null = null;

export async function loadNames(): Promise<NameMatch[]> {
  if (namesCache) return namesCache;
  const rows: NameRow[] = await loadAllNames();
  namesCache = rows.map(r => ({
    name: r.name,
    totalValue: r.total_value,
    reducedNumber: r.reduced_number,
  }));
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
