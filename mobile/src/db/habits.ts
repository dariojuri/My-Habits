import { getDb } from './client';
import type { Habit, HabitInput } from './types';

type HabitRow = {
  id: number;
  name: string;
  emoji: string;
  color: string;
  frequency_type: string;
  frequency_days: string;
  reminder_time: string | null;
  sort_order: number;
  is_active: number;
  created_at: string;
};

function mapRow(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    color: row.color,
    frequencyType: row.frequency_type === 'weekly' ? 'weekly' : 'daily',
    frequencyDays: row.frequency_days
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((v) => Number.isInteger(v) && v >= 0 && v <= 6),
    reminderTime: row.reminder_time,
    sortOrder: row.sort_order,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
  };
}

export async function listHabits(onlyActive = true): Promise<Habit[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<HabitRow>(
    `SELECT * FROM habits ${onlyActive ? 'WHERE is_active = 1' : ''} ORDER BY sort_order ASC, id ASC`,
  );
  return rows.map(mapRow);
}

export async function createHabit(input: HabitInput): Promise<number> {
  const db = await getDb();
  const next = await db.getFirstAsync<{ next: number }>(
    'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM habits',
  );
  const result = await db.runAsync(
    `INSERT INTO habits (name, emoji, color, frequency_type, frequency_days, reminder_time, sort_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
    input.name.trim(),
    input.emoji,
    input.color,
    input.frequencyType,
    input.frequencyDays.join(','),
    input.reminderTime,
    next?.next ?? 0,
  );
  return result.lastInsertRowId;
}

export async function updateHabit(id: number, input: HabitInput): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE habits
     SET name = ?, emoji = ?, color = ?, frequency_type = ?, frequency_days = ?, reminder_time = ?
     WHERE id = ?`,
    input.name.trim(),
    input.emoji,
    input.color,
    input.frequencyType,
    input.frequencyDays.join(','),
    input.reminderTime,
    id,
  );
}

export async function deleteHabit(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM habits WHERE id = ?', id);
}

export async function reorderHabits(orderedIds: number[]): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (let i = 0; i < orderedIds.length; i += 1) {
      await db.runAsync('UPDATE habits SET sort_order = ? WHERE id = ?', i, orderedIds[i]);
    }
  });
}
