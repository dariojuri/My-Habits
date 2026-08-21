import type { DateKey } from '@/lib/date';

export type FrequencyType = 'daily' | 'weekly';

export type Habit = {
  id: number;
  name: string;
  description: string;
  emoji: string;
  color: string;
  frequencyType: FrequencyType;
  /** Giorni della settimana (0=Dom .. 6=Sab), usati solo se frequencyType === 'weekly'. */
  frequencyDays: number[];
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
};

export type HabitInput = {
  name: string;
  description: string;
  emoji: string;
  color: string;
  frequencyType: FrequencyType;
  frequencyDays: number[];
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

export type Task = {
  id: number;
  text: string;
  completed: boolean;
  sortOrder: number;
  createdAt: string;
  completedAt: string | null;
};
