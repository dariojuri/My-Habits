import { getDb } from './client';
import type { Task } from './types';

type TaskRow = {
  id: number;
  text: string;
  completed: number;
  sort_order: number;
  created_at: string;
  completed_at: string | null;
};

function mapRow(row: TaskRow): Task {
  return {
    id: row.id,
    text: row.text,
    completed: row.completed === 1,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}

/** Impegni non completati, persistono indipendentemente dal giorno selezionato. */
export async function listPendingTasks(): Promise<Task[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TaskRow>(
    'SELECT * FROM tasks WHERE completed = 0 ORDER BY sort_order ASC, id ASC',
  );
  return rows.map(mapRow);
}

export async function createTask(text: string): Promise<number> {
  const db = await getDb();
  const next = await db.getFirstAsync<{ next: number }>(
    'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM tasks',
  );
  const result = await db.runAsync(
    'INSERT INTO tasks (text, sort_order) VALUES (?, ?)',
    text.trim(),
    next?.next ?? 0,
  );
  return result.lastInsertRowId;
}

export async function setTaskCompleted(id: number, completed: boolean): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "UPDATE tasks SET completed = ?, completed_at = ? WHERE id = ?",
    completed ? 1 : 0,
    completed ? new Date().toISOString() : null,
    id,
  );
}

export async function deleteTask(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM tasks WHERE id = ?', id);
}
