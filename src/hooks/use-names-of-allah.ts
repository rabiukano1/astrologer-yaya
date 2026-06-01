export interface NameMatch {
  name: string;
  totalValue: number;
  reducedNumber: number;
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
    const totalValue = calculateAbjad(name);
    return { name, totalValue, reducedNumber: reduceNumber(totalValue) };
  });
  return namesCache;
}

export async function searchNamesByValue(value: number): Promise<NameMatch[]> {
  const all = await loadNames();
  return all.filter(n => n.totalValue === value || n.reducedNumber === value);
}
