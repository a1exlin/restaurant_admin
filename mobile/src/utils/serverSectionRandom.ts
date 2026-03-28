import type { DayOfWeek, Shift } from '../types';

export const SERVER_SECTION_LETTERS = ['G', 'P', 'B', 'O', 'R', 'Y'] as const;

export const WEEK_DAYS: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function fairSectionLettersForDay(count: number): string[] {
  if (count <= 0) return [];
  const copies = Math.ceil(count / SERVER_SECTION_LETTERS.length);
  const pool: string[] = [];
  for (let c = 0; c < copies; c++) {
    pool.push(...shuffle([...SERVER_SECTION_LETTERS]));
  }
  return shuffle(pool.slice(0, count));
}

export function shiftWithSectionLetter(shift: Shift | null, letter: string): Shift {
  const tr = shift?.timeRange?.trim() ?? '';
  if (/^\d{1,2}-\d{1,2}$/.test(tr)) {
    return { timeRange: tr, suffix: letter };
  }
  return { timeRange: '11-5', suffix: letter };
}
