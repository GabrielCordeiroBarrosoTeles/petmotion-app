import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { theme } from '@/theme';

const WALK_ID = 'walk-in-progress';
const DAILY_ID = 'daily-walk';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('walk', {
      name: 'Passeio em andamento',
      importance: Notifications.AndroidImportance.LOW,
      lightColor: theme.colors.primary,
    });
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Lembretes',
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: theme.colors.primary,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

/** Notificação fixa com o passeio em andamento (atualizada pelo tracker). */
export async function showWalkNotification(petName: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    identifier: WALK_ID,
    content: {
      title: `Passeando com ${petName}`,
      body,
      sticky: true,
      autoDismiss: false,
      ...(Platform.OS === 'android' ? { channelId: 'walk' } : {}),
    } as Notifications.NotificationContentInput,
    trigger: null,
  }).catch(() => undefined);
}

export async function clearWalkNotification() {
  await Notifications.dismissNotificationAsync(WALK_ID).catch(() => undefined);
  await Notifications.cancelScheduledNotificationAsync(WALK_ID).catch(() => undefined);
}

/** Lembrete às 9h do dia anterior ao vencimento. */
export async function scheduleHealthReminder(petName: string, title: string, isoDate: string) {
  const when = new Date(`${isoDate}T09:00:00`);
  when.setDate(when.getDate() - 1);
  if (when.getTime() <= Date.now()) return;
  await Notifications.scheduleNotificationAsync({
    content: { title: `Amanhã: ${title}`, body: `Não esquece do cuidado de ${petName}.` },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId: 'reminders' },
  }).catch(() => undefined);
}

export async function setDailyWalkReminder(enabled: boolean, petName: string) {
  await Notifications.cancelScheduledNotificationAsync(DAILY_ID).catch(() => undefined);
  if (!enabled) return;
  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_ID,
    content: { title: 'Hora do passeio!', body: `${petName} já está te esperando na porta.` },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 18, minute: 0, channelId: 'reminders' },
  });
}

/** Aviso imediato do passeio ao vivo; tocar abre `url` no app. */
export async function notifyLive(title: string, body: string, url: string) {
  if (!(await ensureNotificationPermission().catch(() => false))) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { url },
      ...(Platform.OS === 'android' ? { channelId: 'reminders' } : {}),
    } as Notifications.NotificationContentInput,
    trigger: null,
  }).catch(() => undefined);
}
