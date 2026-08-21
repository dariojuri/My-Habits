import type { DateKey } from '@/lib/date';
import { getDb } from './client';
import type { DailyCount } from './types';

export async function getCompletedForDate(date: DateKey): Promise<Set<number>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ habit_id: number }>(
    'SELECT habit_id FROM habit_logs WHERE date = ? AND completed = 1',
    date,
  );
  return new Set(rows.map((r) => r.habit_id));
}

export async function setHabitCompleted(
  habitId: number,
  date: DateKey,
  completed: boolean,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO habit_logs (habit_id, date, completed) VALUES (?, ?, ?)
     ON CONFLICT(habit_id, date) DO UPDATE SET completed = excluded.completed`,
    habitId,
    date,
    completed ? 1 : 0,
  );
}

export async function getDailyCounts(from: DateKey, to: DateKey): Promise<DailyCount[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ date: string; completed: number }>(
    `SELECT date, COUNT(*) AS completed
     FROM habit_logs
     WHERE completed = 1 AND date BETWEEN ? AND ?
     GROUP BY date ORDER BY date ASC`,
    from,
    to,
  );
  return rows.map((r) => ({ date: r.date, completed: r.completed }));
}

export async function getCompletedDatesForHabit(
  habitId: number,
  from: DateKey,
  to: DateKey,
): Promise<Set<DateKey>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ date: string }>(
    'SELECT date FROM habit_logs WHERE habit_id = ? AND completed = 1 AND date BETWEEN ? AND ?',
    habitId,
    from,
    to,
  );
  return new Set(rows.map((r) => r.date));
}

/** Tutte le date (ordinate) con almeno un'abitudine completata. */
export async function getAllCompletedDates(): Promise<DateKey[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ date: string }>(
    'SELECT DISTINCT date FROM habit_logs WHERE completed = 1 ORDER BY date ASC',
  );
  return rows.map((r) => r.date);
}
