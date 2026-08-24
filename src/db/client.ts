import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Migrazioni semplici e idempotenti: sicure a ogni avvio. */
async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT '#4F8DF7',
      frequency_type TEXT NOT NULL DEFAULT 'daily',
      frequency_days TEXT NOT NULL DEFAULT '',
      reminder_time TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      UNIQUE (habit_id, date)
    );

    CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date);

    CREATE TABLE IF NOT EXISTS moments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_moments_date ON moments(date);

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS day_ratings (
      date TEXT PRIMARY KEY,
      mood INTEGER,
      score INTEGER,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS task_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      UNIQUE (task_id, date)
    );
  `);
}

/** Aggiunge colonne a tabelle già esistenti: idempotente, verifica lo schema prima di alterarlo. */
async function migrateColumns(db: SQLite.SQLiteDatabase): Promise<void> {
  const habitColumns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(habits)');
  if (!habitColumns.some((c) => c.name === 'description')) {
    await db.execAsync("ALTER TABLE habits ADD COLUMN description TEXT NOT NULL DEFAULT ''");
  }

  const taskColumns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(tasks)');
  if (!taskColumns.some((c) => c.name === 'time')) {
    await db.execAsync('ALTER TABLE tasks ADD COLUMN time TEXT');
  }
  if (!taskColumns.some((c) => c.name === 'date')) {
    await db.execAsync('ALTER TABLE tasks ADD COLUMN date TEXT');
  }
  if (!taskColumns.some((c) => c.name === 'recurrence_days')) {
    await db.execAsync("ALTER TABLE tasks ADD COLUMN recurrence_days TEXT NOT NULL DEFAULT ''");
    // Gli impegni creati prima dell'introduzione della data venivano mostrati ogni giorno:
    // li ancoriamo a oggi una tantum, così restano visibili invece di sparire.
    await db.execAsync(
      "UPDATE tasks SET date = date('now') WHERE date IS NULL AND recurrence_days = ''",
    );
  }
}

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('daily-journal.db');
      await migrate(db);
      await migrateColumns(db);
      return db;
    })();
  }
  return dbPromise;
}
