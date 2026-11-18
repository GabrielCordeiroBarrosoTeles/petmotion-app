import * as Haptics from 'expo-haptics';
import { useToastStore, type ToastType } from '@/store/toast';

const feedback: Record<ToastType, Haptics.NotificationFeedbackType> = {
  success: Haptics.NotificationFeedbackType.Success,
  warning: Haptics.NotificationFeedbackType.Warning,
  danger: Haptics.NotificationFeedbackType.Error,
};

export function customToast(message: string, type: ToastType) {
  Haptics.notificationAsync(feedback[type]).catch(() => undefined);
  useToastStore.getState().show(message, type);
}
