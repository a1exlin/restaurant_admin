import type { DayOfWeek } from '../types';

const DAY_ORDER: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export function getWeekDates(weekStart: Date): { day: DayOfWeek; date: Date; label: string }[] {
  const result: { day: DayOfWeek; date: Date; label: string }[] = [];
  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    result.push({
      day: DAY_ORDER[i],
      date: d,
      label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
    });
  }
  return result;
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatShiftDisplay(shift: { timeRange: string; suffix?: string } | null): string {
  if (!shift) return '';
  return shift.suffix ? `${shift.timeRange}${shift.suffix}` : shift.timeRange;
}

export function parseShiftInput(value: string): { timeRange: string; suffix?: string } | null {
  const trimmed = value.trim().toUpperCase();
  if (!trimmed) return null;
  const match = trimmed.match(/^(\d{1,2}-\d{1,2})([A-Z]*)$/);
  if (match) {
    return {
      timeRange: match[1],
      suffix: match[2] || undefined,
    };
  }
  if (['RO', 'S', 'OFF', 'BAR', 'H'].includes(trimmed)) {
    return { timeRange: trimmed };
  }
  return { timeRange: trimmed };
}
