import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  parseISO,
  startOfMonth,
} from 'date-fns';
import { it } from 'date-fns/locale';

/** Chiave interna sempre YYYY-MM-DD, calcolata in orario locale. */
export type DateKey = string;

export function toKey(date: Date): DateKey {
  return format(date, 'yyyy-MM-dd');
}

export function fromKey(key: DateKey): Date {
  return parseISO(key);
}

export function todayKey(): DateKey {
  return toKey(new Date());
}

export function shiftKey(key: DateKey, days: number): DateKey {
  return toKey(addDays(fromKey(key), days));
}

export function shiftMonth(key: DateKey, months: number): DateKey {
  return toKey(addMonths(fromKey(key), months));
}

/** 0 = domenica ... 6 = sabato (coerente con getDay di date-fns). */
export function weekdayOf(key: DateKey): number {
  return getDay(fromKey(key));
}

export function monthDays(key: DateKey): DateKey[] {
  const base = fromKey(key);
  return eachDayOfInterval({ start: startOfMonth(base), end: endOfMonth(base) }).map(toKey);
}

export function formatLongDate(key: DateKey): string {
  return format(fromKey(key), "EEEE d MMMM yyyy", { locale: it });
}

export function formatMonthTitle(key: DateKey): string {
  return format(fromKey(key), 'LLLL yyyy', { locale: it });
}

export function formatDayNumber(key: DateKey): string {
  return format(fromKey(key), 'd');
}

export function isToday(key: DateKey): boolean {
  return isSameDay(fromKey(key), new Date());
}

export const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'] as const;
