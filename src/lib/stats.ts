import { shiftKey, todayKey, type DateKey } from './date';

/** Streak corrente: giorni consecutivi (fino a oggi o ieri) con almeno un completamento. */
export function currentStreak(dates: Set<DateKey>): number {
  const today = todayKey();
  let cursor = dates.has(today) ? today : shiftKey(today, -1);
  if (!dates.has(cursor)) return 0;
  let streak = 0;
  while (dates.has(cursor)) {
    streak += 1;
    cursor = shiftKey(cursor, -1);
  }
  return streak;
}

/** Streak più lunga mai raggiunta. */
export function bestStreak(sortedDates: DateKey[]): number {
  let best = 0;
  let run = 0;
  let previous: DateKey | null = null;
  for (const date of sortedDates) {
    run = previous !== null && shiftKey(previous, 1) === date ? run + 1 : 1;
    best = Math.max(best, run);
    previous = date;
  }
  return best;
}
