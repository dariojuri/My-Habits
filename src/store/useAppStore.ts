import { create } from 'zustand';
import * as habitsDb from '@/db/habits';
import * as logsDb from '@/db/logs';
import * as momentsDb from '@/db/moments';
import * as tasksDb from '@/db/tasks';
import type { Habit, HabitInput, Moment, Task } from '@/db/types';
import { todayKey, weekdayOf, type DateKey } from '@/lib/date';

type AppState = {
  ready: boolean;
  selectedDate: DateKey;
  habits: Habit[];
  completed: Set<number>;
  moments: Moment[];
  tasks: Task[];

  init: () => Promise<void>;
  setSelectedDate: (date: DateKey) => Promise<void>;
  refreshDay: () => Promise<void>;
  refreshHabits: () => Promise<void>;
  refreshTasks: () => Promise<void>;

  toggleHabit: (habitId: number) => Promise<void>;
  addHabit: (input: HabitInput) => Promise<void>;
  editHabit: (id: number, input: HabitInput) => Promise<void>;
  removeHabit: (id: number) => Promise<void>;
  moveHabit: (id: number, direction: -1 | 1) => Promise<void>;

  addMoment: (text: string) => Promise<void>;
  editMoment: (id: number, text: string) => Promise<void>;
  removeMoment: (id: number) => Promise<void>;

  addTask: (text: string) => Promise<void>;
  completeTask: (id: number) => Promise<void>;
  removeTask: (id: number) => Promise<void>;
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
  moments: [],
  tasks: [],

  init: async () => {
    const habits = await habitsDb.listHabits();
    const date = get().selectedDate;
    const [completed, moments, tasks] = await Promise.all([
      logsDb.getCompletedForDate(date),
      momentsDb.listMoments(date),
      tasksDb.listPendingTasks(),
    ]);
    set({ habits, completed, moments, tasks, ready: true });
  },

  setSelectedDate: async (date) => {
    set({ selectedDate: date });
    await get().refreshDay();
  },

  refreshDay: async () => {
    const date = get().selectedDate;
    const [completed, moments] = await Promise.all([
      logsDb.getCompletedForDate(date),
      momentsDb.listMoments(date),
    ]);
    set({ completed, moments });
  },

  refreshHabits: async () => {
    set({ habits: await habitsDb.listHabits() });
  },

  refreshTasks: async () => {
    set({ tasks: await tasksDb.listPendingTasks() });
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

  addMoment: async (text) => {
    if (!text.trim()) return;
    await momentsDb.createMoment(get().selectedDate, text);
    await get().refreshDay();
  },

  editMoment: async (id, text) => {
    if (!text.trim()) return;
    await momentsDb.updateMoment(id, text);
    await get().refreshDay();
  },

  removeMoment: async (id) => {
    await momentsDb.deleteMoment(id);
    await get().refreshDay();
  },

  addTask: async (text) => {
    if (!text.trim()) return;
    await tasksDb.createTask(text);
    await get().refreshTasks();
  },

  completeTask: async (id) => {
    const previous = get().tasks;
    set({ tasks: previous.filter((t) => t.id !== id) });
    await tasksDb.setTaskCompleted(id, true);
  },

  removeTask: async (id) => {
    await tasksDb.deleteTask(id);
    await get().refreshTasks();
  },
}));
