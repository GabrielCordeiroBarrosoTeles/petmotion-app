import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '@/store/auth';

/** Toques já tratados (a última resposta continua disponível depois de usada). */
const handled = new Set<string>();

function open(response: Notifications.NotificationResponse | null) {
  if (!response) return;
  const { identifier, content } = response.notification.request;
  const url = content.data?.url;
  if (typeof url !== 'string' || handled.has(identifier)) return;
  handled.add(identifier);
  router.push(url as never);
}

/** Tocar numa notificação com `data.url` abre essa tela (com o app aberto ou vindo de fechado). */
export function useNotificationLinks() {
  const signedIn = useAuth((s) => s.status === 'signedIn');

  useEffect(() => {
    if (!signedIn) return;
    open(Notifications.getLastNotificationResponse());
    const sub = Notifications.addNotificationResponseReceivedListener(open);
    return () => sub.remove();
  }, [signedIn]);
}
