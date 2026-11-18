import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useToastStore } from '@/store/toast';
import { HEALTH_META } from '../health';
import { celebrate, select, tap, thump } from '../haptics';
import {
  clearWalkNotification, ensureNotificationPermission, scheduleHealthReminder, setDailyWalkReminder, showWalkNotification,
} from '../notifications';
import { customToast } from '../toast';

describe('haptics', () => {
  it('dispara cada tipo de vibração', async () => {
    await Promise.all([tap(), thump(), select(), celebrate()]);
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
    expect(Haptics.impactAsync).toHaveBeenCalledWith('heavy');
    expect(Haptics.selectionAsync).toHaveBeenCalled();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
  });

  it('ignora falhas do háptico', async () => {
    jest.mocked(Haptics.impactAsync).mockRejectedValueOnce(new Error('sem motor'));
    jest.mocked(Haptics.selectionAsync).mockRejectedValueOnce(new Error('x'));
    jest.mocked(Haptics.notificationAsync).mockRejectedValueOnce(new Error('x'));
    await expect(tap()).resolves.toBeUndefined();
    await expect(select()).resolves.toBeUndefined();
    await expect(celebrate()).resolves.toBeUndefined();
    jest.mocked(Haptics.impactAsync).mockRejectedValueOnce(new Error('x'));
    await expect(thump()).resolves.toBeUndefined();
  });
});

describe('customToast', () => {
  it('mostra o toast e vibra conforme o tipo', () => {
    customToast('Salvo!', 'success');
    expect(useToastStore.getState().current).toMatchObject({ message: 'Salvo!', type: 'success' });
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
  });

  it('não quebra se o háptico falhar', () => {
    jest.mocked(Haptics.notificationAsync).mockRejectedValueOnce(new Error('x'));
    customToast('Ops', 'danger');
    expect(useToastStore.getState().current?.type).toBe('danger');
  });
});

describe('HEALTH_META', () => {
  it('tem rótulo e ícone para cada tipo', () => {
    expect(Object.keys(HEALTH_META)).toEqual(['vaccine', 'vermifuge', 'medicine', 'vet']);
    expect(HEALTH_META.vaccine.label).toBe('Vacina');
  });
});

describe('notifications', () => {
  const setOS = (os: 'ios' | 'android') => Object.defineProperty(Platform, 'OS', { value: os, configurable: true });
  afterEach(() => setOS('ios'));

  it('registra um handler que mostra banner sem som', async () => {
    // o handler é registrado quando o módulo é importado
    jest.isolateModules(() => require('../notifications'));
    const handler = jest.mocked(Notifications.setNotificationHandler).mock.calls.at(-1)![0]!;
    await expect(handler.handleNotification({} as never)).resolves.toMatchObject({ shouldShowBanner: true, shouldPlaySound: false });
  });

  it('cria os canais no Android e já tem permissão', async () => {
    setOS('android');
    await expect(ensureNotificationPermission()).resolves.toBe(true);
    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledTimes(2);
  });

  it('pede permissão quando ainda não tem (iOS, sem canais)', async () => {
    jest.mocked(Notifications.getPermissionsAsync).mockResolvedValueOnce({ granted: false } as never);
    jest.mocked(Notifications.requestPermissionsAsync).mockResolvedValueOnce({ granted: false } as never);
    await expect(ensureNotificationPermission()).resolves.toBe(false);
    expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
  });

  it('mostra a notificação fixa do passeio (canal no Android)', async () => {
    await showWalkNotification('Thor', '10:00');
    expect(jest.mocked(Notifications.scheduleNotificationAsync).mock.calls[0][0].content).not.toHaveProperty('channelId');
    setOS('android');
    await showWalkNotification('Thor', '10:00');
    expect(jest.mocked(Notifications.scheduleNotificationAsync).mock.calls[1][0].content).toMatchObject({ channelId: 'walk', sticky: true });
  });

  it('ignora falha ao mostrar ou limpar a notificação do passeio', async () => {
    jest.mocked(Notifications.scheduleNotificationAsync).mockRejectedValueOnce(new Error('x'));
    await expect(showWalkNotification('Thor', 'x')).resolves.toBeUndefined();
    jest.mocked(Notifications.dismissNotificationAsync).mockRejectedValueOnce(new Error('x'));
    jest.mocked(Notifications.cancelScheduledNotificationAsync).mockRejectedValueOnce(new Error('x'));
    await expect(clearWalkNotification()).resolves.toBeUndefined();
  });

  it('agenda o lembrete de saúde para a véspera às 9h, só no futuro', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-17T10:00:00'));
    await scheduleHealthReminder('Thor', 'V10', '2026-11-25');
    const trigger = jest.mocked(Notifications.scheduleNotificationAsync).mock.calls[0][0].trigger as { date: Date };
    expect(trigger.date).toEqual(new Date('2026-11-24T09:00:00'));

    await scheduleHealthReminder('Thor', 'V10', '2026-11-17');
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);

    jest.mocked(Notifications.scheduleNotificationAsync).mockRejectedValueOnce(new Error('x'));
    await expect(scheduleHealthReminder('Thor', 'V10', '2026-12-25')).resolves.toBeUndefined();
    jest.useRealTimers();
  });

  it('liga e desliga o lembrete diário de passeio', async () => {
    await setDailyWalkReminder(false, 'Thor');
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    await setDailyWalkReminder(true, 'Thor');
    expect(jest.mocked(Notifications.scheduleNotificationAsync).mock.calls[0][0].trigger).toMatchObject({ hour: 18, minute: 0 });

    jest.mocked(Notifications.cancelScheduledNotificationAsync).mockRejectedValueOnce(new Error('x'));
    await expect(setDailyWalkReminder(false, 'Thor')).resolves.toBeUndefined();
  });
});
