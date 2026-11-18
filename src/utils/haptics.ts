import * as Haptics from 'expo-haptics';

export const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
export const thump = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined);
export const select = () => Haptics.selectionAsync().catch(() => undefined);
export const celebrate = () =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
