import { requireOptionalNativeModule } from 'expo-modules-core';
import { DeviceEventEmitter } from 'react-native';

/** Ações que o relógio manda para o celular. */
export type WatchAction = 'pee' | 'poop' | 'water' | 'pause' | 'resume' | 'start' | 'finish';

/** Estado do passeio que o celular publica para o relógio (o relógio só desenha). */
export interface WatchState {
  status: 'idle' | 'running' | 'paused';
  pet: string | null;
  /** Tempo acumulado até `at`; rodando, o relógio soma o tempo desde `at` para o cronômetro andar sozinho. */
  elapsedMs: number;
  at: number;
  distance: number;
  steps: number;
  counts: { pee: number; poop: number; water: number };
}

interface WearBridgeNative {
  publish(json: string): void;
}

/** Nome do evento que o módulo nativo emite (WearBridgeModule.JS_EVENT). */
export const WATCH_ACTION_EVENT = 'WearBridgeAction';

const ACTIONS: WatchAction[] = ['pee', 'poop', 'water', 'pause', 'resume', 'start', 'finish'];
const isAction = (value: string): value is WatchAction => (ACTIONS as string[]).includes(value);

/** Ponte com o relógio. Sem o módulo nativo (Expo Go, iOS, web) vira no-op. */
export const wear = {
  get available() {
    return requireOptionalNativeModule<WearBridgeNative>('WearBridge') !== null;
  },
  publish(state: WatchState) {
    requireOptionalNativeModule<WearBridgeNative>('WearBridge')?.publish(JSON.stringify(state));
  },
  onAction(listener: (action: WatchAction) => void): { remove(): void } {
    if (!requireOptionalNativeModule<WearBridgeNative>('WearBridge')) return { remove: () => undefined };
    // só repassa o que o app conhece: um relógio de outra versão não quebra o celular
    return DeviceEventEmitter.addListener(WATCH_ACTION_EVENT, ({ action }: { action: string }) => {
      if (isAction(action)) listener(action);
    });
  },
};
