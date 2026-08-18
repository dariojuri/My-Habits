import type { DateKey } from '@/lib/date';

export type FrequencyType = 'daily' | 'weekly';

export type Habit = {
  id: number;
  name: string;
  emoji: string;
  color: string;
  frequencyType: FrequencyType;
  /** Giorni della settimana (0=Dom .. 6=Sab), usati solo se frequencyType === 'weekly'. */
  frequencyDays: number[];
  /** "HH:mm" oppure null. */
  reminderTime: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
};

export type HabitInput = {
  name: string;
  emoji: string;
  color: string;
  frequencyType: FrequencyType;
  frequencyDays: number[];
  reminderTime: string | null;
};

export type Moment = {
  id: number;
  date: DateKey;
  text: string;
  createdAt: string;
};

export type HabitLog = {
  habitId: number;
  date: DateKey;
  completed: boolean;
};

export type DailyCount = {
  date: DateKey;
  completed: number;
};
