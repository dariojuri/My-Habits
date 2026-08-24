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
  /** "HH:mm" oppure null (impegno senza orario). */
  time: string | null;
  /** Giorno specifico dell'impegno; null solo per gli impegni ricorrenti. */
  date: DateKey | null;
  /** Giorni della settimana (0=Dom .. 6=Sab) in cui si ripete; [] = non ricorrente. */
  recurrenceDays: number[];
  /** Rilevante solo per impegni non ricorrenti (completamento singolo). */
  completed: boolean;
  sortOrder: number;
  createdAt: string;
  completedAt: string | null;
};

export type TaskInput = {
  text: string;
  time: string | null;
  /** Giorno per cui creare l'impegno se non ricorrente. */
  date: DateKey;
  recurrenceDays: number[];
};

/** Un impegno risolto per un giorno preciso: unifica occorrenze singole e ricorrenti. */
export type TaskOccurrence = {
  taskId: number;
  text: string;
  time: string | null;
  isRecurring: boolean;
  completed: boolean;
};

export type DayRating = {
  date: DateKey;
  /** 1 (pessimo) .. 5 (ottimo), nullable. */
  mood: number | null;
  /** Voto generale 1..10, nullable. */
  score: number | null;
  updatedAt: string;
};
