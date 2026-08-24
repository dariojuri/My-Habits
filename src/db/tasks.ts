import { weekdayOf, type DateKey } from '@/lib/date';
import { getDb } from './client';
import type { Task, TaskInput, TaskOccurrence } from './types';

type TaskRow = {
  id: number;
  text: string;
  time: string | null;
  date: string | null;
  recurrence_days: string;
  completed: number;
  sort_order: number;
  created_at: string;
  completed_at: string | null;
};

function parseDays(value: string): number[] {
  return value
    .split(',')
    .map((v) => Number(v.trim()))
    .filter((v) => Number.isInteger(v) && v >= 0 && v <= 6);
}

function mapRow(row: TaskRow): Task {
  return {
    id: row.id,
    text: row.text,
    time: row.time,
    date: row.date,
    recurrenceDays: parseDays(row.recurrence_days),
    completed: row.completed === 1,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}

export async function getTask(id: number): Promise<Task | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<TaskRow>('SELECT * FROM tasks WHERE id = ?', id);
  return row ? mapRow(row) : null;
}

/** Impegni risolti per un giorno preciso: quelli datati a quel giorno più le ricorrenze che ricadono su quel giorno della settimana, esclusi quelli già completati. */
export async function listTasksForDate(date: DateKey): Promise<TaskOccurrence[]> {
  const db = await getDb();

  const oneOff = await db.getAllAsync<TaskRow>(
    "SELECT * FROM tasks WHERE recurrence_days = '' AND date = ? AND completed = 0 ORDER BY sort_order ASC, id ASC",
    date,
  );

  const recurringRows = await db.getAllAsync<TaskRow>(
    "SELECT * FROM tasks WHERE recurrence_days != '' ORDER BY sort_order ASC, id ASC",
  );
  const weekday = weekdayOf(date);
  const recurringToday = recurringRows.filter((row) =>
    parseDays(row.recurrence_days).includes(weekday),
  );

  const doneLogs = await db.getAllAsync<{ task_id: number }>(
    'SELECT task_id FROM task_logs WHERE date = ? AND completed = 1',
    date,
  );
  const doneToday = new Set(doneLogs.map((l) => l.task_id));

  const occurrences: TaskOccurrence[] = [
    ...oneOff.map((row) => ({
      taskId: row.id,
      text: row.text,
      time: row.time,
      isRecurring: false,
      completed: false,
    })),
    ...recurringToday
      .filter((row) => !doneToday.has(row.id))
      .map((row) => ({
        taskId: row.id,
        text: row.text,
        time: row.time,
        isRecurring: true,
        completed: false,
      })),
  ];

  occurrences.sort((a, b) => (a.time ?? '99:99').localeCompare(b.time ?? '99:99'));
  return occurrences;
}

export async function createTask(input: TaskInput): Promise<number> {
  const db = await getDb();
  const next = await db.getFirstAsync<{ next: number }>(
    'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM tasks',
  );
  const isRecurring = input.recurrenceDays.length > 0;
  const result = await db.runAsync(
    'INSERT INTO tasks (text, time, date, recurrence_days, sort_order) VALUES (?, ?, ?, ?, ?)',
    input.text.trim(),
    input.time,
    isRecurring ? null : input.date,
    input.recurrenceDays.join(','),
    next?.next ?? 0,
  );
  return result.lastInsertRowId;
}

export async function updateTask(id: number, input: TaskInput): Promise<void> {
  const db = await getDb();
  const isRecurring = input.recurrenceDays.length > 0;
  await db.runAsync(
    'UPDATE tasks SET text = ?, time = ?, date = ?, recurrence_days = ? WHERE id = ?',
    input.text.trim(),
    input.time,
    isRecurring ? null : input.date,
    input.recurrenceDays.join(','),
    id,
  );
}

export async function setOccurrenceCompleted(
  taskId: number,
  date: DateKey,
  isRecurring: boolean,
  completed: boolean,
): Promise<void> {
  const db = await getDb();
  if (isRecurring) {
    await db.runAsync(
      `INSERT INTO task_logs (task_id, date, completed) VALUES (?, ?, ?)
       ON CONFLICT(task_id, date) DO UPDATE SET completed = excluded.completed`,
      taskId,
      date,
      completed ? 1 : 0,
    );
  } else {
    await db.runAsync(
      'UPDATE tasks SET completed = ?, completed_at = ? WHERE id = ?',
      completed ? 1 : 0,
      completed ? new Date().toISOString() : null,
      taskId,
    );
  }
}

export async function deleteTask(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM tasks WHERE id = ?', id);
}
