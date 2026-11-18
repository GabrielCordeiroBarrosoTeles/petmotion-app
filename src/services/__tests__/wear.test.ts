import { requireOptionalNativeModule } from 'expo-modules-core';
import { DeviceEventEmitter } from 'react-native';
import { WATCH_ACTION_EVENT, wear, type WatchState } from '../wear';

jest.mock('expo-modules-core', () => ({ requireOptionalNativeModule: jest.fn(() => null) }));

const state: WatchState = {
  status: 'running', pet: 'Thor', elapsedMs: 1000, at: 5, distance: 10, steps: 3, counts: { pee: 1, poop: 0, water: 0 },
};

describe('wear (ponte com o relógio)', () => {
  it('sem o módulo nativo (Expo Go, iOS) não faz nada e não quebra', () => {
    expect(wear.available).toBe(false);
    wear.publish(state);
    const listener = jest.fn();
    wear.onAction(listener).remove();
    expect(listener).not.toHaveBeenCalled();
  });

  it('com o módulo: publica o estado em JSON e só repassa ações conhecidas', () => {
    const emit = (p: { action: string }) => DeviceEventEmitter.emit(WATCH_ACTION_EVENT, p);
    const native = { publish: jest.fn() };
    jest.mocked(requireOptionalNativeModule).mockReturnValue(native);

    expect(wear.available).toBe(true);
    wear.publish(state);
    expect(JSON.parse(native.publish.mock.calls[0][0])).toEqual(state);

    const listener = jest.fn();
    const sub = wear.onAction(listener);
    emit({ action: 'pee' });
    emit({ action: 'latir' }); // relógio de outra versão: ignorado
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('pee');
    sub.remove();
    emit({ action: 'water' }); // depois de sair, não chega mais
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
