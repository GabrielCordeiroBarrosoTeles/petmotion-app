import * as Haptics from 'expo-haptics';
import { useConfirmStore, type ConfirmOptions } from '@/store/confirm';

/** Pergunta com a folha de confirmação da marca. Resolve true se a pessoa confirmar. */
export function confirmAction(options: ConfirmOptions): Promise<boolean> {
  if (options.tone !== 'ink') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
  return useConfirmStore.getState().ask(options);
}
