import type { DateKey } from '@/lib/date';
import { getDb } from './client';
import type { Moment } from './types';

type MomentRow = { id: number; date: string; text: string; created_at: string };

export async function listMoments(date: DateKey): Promise<Moment[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<MomentRow>(
    'SELECT * FROM moments WHERE date = ? ORDER BY id ASC',
    date,
  );
  return rows.map((r) => ({ id: r.id, date: r.date, text: r.text, createdAt: r.created_at }));
}

export async function createMoment(date: DateKey, text: string): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO moments (date, text) VALUES (?, ?)',
    date,
    text.trim(),
  );
  return result.lastInsertRowId;
}

export async function updateMoment(id: number, text: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE moments SET text = ? WHERE id = ?', text.trim(), id);
}

export async function deleteMoment(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM moments WHERE id = ?', id);
}
