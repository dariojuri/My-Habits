import { create } from 'zustand';
import * as dayRatingsDb from '@/db/dayRatings';
import * as habitsDb from '@/db/habits';
import * as logsDb from '@/db/logs';
import * as tasksDb from '@/db/tasks';
import type { DayRating, Habit, HabitInput, TaskInput, TaskOccurrence } from '@/db/types';
import { todayKey, weekdayOf, type DateKey } from '@/lib/date';

type AppState = {
  ready: boolean;
  selectedDate: DateKey;
  habits: Habit[];
  completed: Set<number>;
  tasks: TaskOccurrence[];
  todayRating: DayRating | null;

  init: () => Promise<void>;
  setSelectedDate: (date: DateKey) => Promise<void>;
  refreshDay: () => Promise<void>;
  refreshHabits: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  refreshTodayRating: () => Promise<void>;

  toggleHabit: (habitId: number) => Promise<void>;
  addHabit: (input: HabitInput) => Promise<void>;
  editHabit: (id: number, input: HabitInput) => Promise<void>;
  removeHabit: (id: number) => Promise<void>;
  moveHabit: (id: number, direction: -1 | 1) => Promise<void>;

  addTask: (input: TaskInput) => Promise<void>;
  editTask: (id: number, input: TaskInput) => Promise<void>;
  completeTask: (occurrence: TaskOccurrence) => Promise<void>;
  removeTask: (id: number) => Promise<void>;

  setTodayMood: (mood: number | null) => Promise<void>;
  setTodayScore: (score: number | null) => Promise<void>;
};

export function habitPlannedOn(habit: Habit, date: DateKey): boolean {
  if (!habit.isActive) return false;
  if (habit.frequencyType === 'daily') return true;
  if (habit.frequencyDays.length === 0) return true;
  return habit.frequencyDays.includes(weekdayOf(date));
}

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  selectedDate: todayKey(),
  habits: [],
  completed: new Set<number>(),
  tasks: [],
  todayRating: null,

  init: async () => {
    const habits = await habitsDb.listHabits();
    const date = get().selectedDate;
    const [completed, tasks, todayRating] = await Promise.all([
      logsDb.getCompletedForDate(date),
      tasksDb.listTasksForDate(date),
      dayRatingsDb.getDayRating(todayKey()),
    ]);
    set({ habits, completed, tasks, todayRating, ready: true });
  },

  setSelectedDate: async (date) => {
    set({ selectedDate: date });
    await get().refreshDay();
  },

  refreshDay: async () => {
    const date = get().selectedDate;
    const [completed, tasks] = await Promise.all([
      logsDb.getCompletedForDate(date),
      tasksDb.listTasksForDate(date),
    ]);
    set({ completed, tasks });
  },

  refreshHabits: async () => {
    set({ habits: await habitsDb.listHabits() });
  },

  refreshTasks: async () => {
    set({ tasks: await tasksDb.listTasksForDate(get().selectedDate) });
  },

  refreshTodayRating: async () => {
    set({ todayRating: await dayRatingsDb.getDayRating(todayKey()) });
  },

  toggleHabit: async (habitId) => {
    const { selectedDate, completed } = get();
    const next = new Set(completed);
    const willComplete = !next.has(habitId);
    if (willComplete) next.add(habitId);
    else next.delete(habitId);
    set({ completed: next });
    await logsDb.setHabitCompleted(habitId, selectedDate, willComplete);
  },

  addHabit: async (input) => {
    await habitsDb.createHabit(input);
    await get().refreshHabits();
  },

  editHabit: async (id, input) => {
    await habitsDb.updateHabit(id, input);
    await get().refreshHabits();
  },

  removeHabit: async (id) => {
    await habitsDb.deleteHabit(id);
    await get().refreshHabits();
    await get().refreshDay();
  },

  moveHabit: async (id, direction) => {
    const ids = get().habits.map((h) => h.id);
    const index = ids.indexOf(id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    await habitsDb.reorderHabits(ids);
    await get().refreshHabits();
  },

  addTask: async (input) => {
    if (!input.text.trim()) return;
    await tasksDb.createTask(input);
    await get().refreshTasks();
  },

  editTask: async (id, input) => {
    if (!input.text.trim()) return;
    await tasksDb.updateTask(id, input);
    await get().refreshTasks();
  },

  completeTask: async (occurrence) => {
    const previous = get().tasks;
    set({ tasks: previous.filter((t) => t.taskId !== occurrence.taskId) });
    await tasksDb.setOccurrenceCompleted(
      occurrence.taskId,
      get().selectedDate,
      occurrence.isRecurring,
      true,
    );
  },

  removeTask: async (id) => {
    await tasksDb.deleteTask(id);
    await get().refreshTasks();
  },

  setTodayMood: async (mood) => {
    const date = todayKey();
    await dayRatingsDb.setMood(date, mood);
    await get().refreshTodayRating();
  },

  setTodayScore: async (score) => {
    const date = todayKey();
    await dayRatingsDb.setScore(date, score);
    await get().refreshTodayRating();
  },
}));
