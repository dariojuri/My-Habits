import type { DateKey } from '@/lib/date';
import { getDb } from './client';
import type { DayRating } from './types';

type DayRatingRow = {
  date: string;
  mood: number | null;
  score: number | null;
  updated_at: string;
};

function mapRow(row: DayRatingRow): DayRating {
  return { date: row.date, mood: row.mood, score: row.score, updatedAt: row.updated_at };
}

export async function getDayRating(date: DateKey): Promise<DayRating | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<DayRatingRow>(
    'SELECT * FROM day_ratings WHERE date = ?',
    date,
  );
  return row ? mapRow(row) : null;
}

export async function getRatingsForRange(from: DateKey, to: DateKey): Promise<DayRating[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<DayRatingRow>(
    'SELECT * FROM day_ratings WHERE date >= ? AND date <= ? ORDER BY date ASC',
    from,
    to,
  );
  return rows.map(mapRow);
}

async function upsert(date: DateKey, mood: number | null, score: number | null): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO day_ratings (date, mood, score, updated_at) VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(date) DO UPDATE SET mood = excluded.mood, score = excluded.score, updated_at = excluded.updated_at`,
    date,
    mood,
    score,
  );
}

export async function setMood(date: DateKey, mood: number | null): Promise<void> {
  const existing = await getDayRating(date);
  await upsert(date, mood, existing?.score ?? null);
}

export async function setScore(date: DateKey, score: number | null): Promise<void> {
  const existing = await getDayRating(date);
  await upsert(date, existing?.mood ?? null, score);
}
