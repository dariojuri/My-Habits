import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Habit } from '@/db/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensurePermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Promemoria abitudini',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

function parseTime(time: string): { hour: number; minute: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

/**
 * Ripianifica da zero tutti i promemoria ricorrenti.
 * Chiamata all'avvio dell'app e a ogni modifica delle abitudini, così i
 * trigger giornalieri/settimanali restano validi anche dopo un riavvio.
 */
export async function rescheduleAllReminders(habits: Habit[]): Promise<void> {
  const withReminder = habits.filter((h) => h.isActive && h.reminderTime);
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (withReminder.length === 0) return;

  const granted = await ensurePermissions();
  if (!granted) return;

  for (const habit of withReminder) {
    const parsed = parseTime(habit.reminderTime as string);
    if (!parsed) continue;

    const content = {
      title: `${habit.emoji} ${habit.name}`.trim(),
      body: 'È il momento della tua abitudine.',
    };

    if (habit.frequencyType === 'daily' || habit.frequencyDays.length === 0) {
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: parsed.hour,
          minute: parsed.minute,
          channelId: 'reminders',
        },
      });
    } else {
      for (const day of habit.frequencyDays) {
        await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            // expo-notifications: 1 = domenica ... 7 = sabato
            weekday: day + 1,
            hour: parsed.hour,
            minute: parsed.minute,
            channelId: 'reminders',
          },
        });
      }
    }
  }
}
