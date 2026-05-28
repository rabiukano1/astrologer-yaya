import { useMemo } from 'react';

export type ElementCategory = 'نار' | 'تراب' | 'هواء' | 'ماء';

export interface AnalysisResult {
  fullName: string;
  motherName: string;
  totalValue: number;
  reducedNumber: number;
  spiritualNumber: number;
  element: ElementCategory;
  letterBreakdown: { letter: string; value: number }[];
}

const abjadMap: Record<string, number> = {
  ا: 1,
  ب: 2,
  ج: 3,
  د: 4,
  ه: 5,
  و: 6,
  ز: 7,
  ح: 8,
  ط: 9,
  ي: 10,
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
  let result = n;
  while (result > 9) {
    result = String(result)
      .split('')
      .reduce((sum, d) => sum + parseInt(d, 10), 0);
  }
  return result;
}

function getElement(total: number): ElementCategory {
  const reduced = reduceNumber(total);
  if (reduced === 1 || reduced === 4 || reduced === 7) return 'نار';
  if (reduced === 2 || reduced === 5 || reduced === 8) return 'تراب';
  if (reduced === 3 || reduced === 6 || reduced === 9) return 'هواء';
  return 'ماء';
}

function analyzeName(name: string): { total: number; breakdown: { letter: string; value: number }[] } {
  const cleaned = name.replace(/[\s\-]/g, '');
  const breakdown: { letter: string; value: number }[] = [];

  for (const char of cleaned) {
    const val = abjadMap[char] || 0;
    if (val > 0) {
      breakdown.push({ letter: char, value: val });
    }
  }

  return { total: calculateAbjad(cleaned), breakdown };
}

export function useNameAnalysis(fullName: string, motherName: string): AnalysisResult | null {
  return useMemo(() => {
    if (!fullName.trim()) return null;

    const nameResult = analyzeName(fullName);
    const motherResult = motherName.trim() ? analyzeName(motherName) : null;

    const combinedTotal = nameResult.total + (motherResult?.total ?? 0);
    const reduced = reduceNumber(combinedTotal);

    let spiritualNumber = reduced;
    if (spiritualNumber === 0) spiritualNumber = 1;

    const combinedBreakdown = [
      { letter: '─', value: nameResult.total },
      ...nameResult.breakdown,
    ];

    if (motherResult) {
      combinedBreakdown.push({ letter: '─', value: motherResult.total });
      combinedBreakdown.push(...motherResult.breakdown);
    }

    return {
      fullName,
      motherName: motherName || '—',
      totalValue: combinedTotal,
      reducedNumber: reduced,
      spiritualNumber,
      element: getElement(combinedTotal),
      letterBreakdown: combinedBreakdown,
    };
  }, [fullName, motherName]);
}
