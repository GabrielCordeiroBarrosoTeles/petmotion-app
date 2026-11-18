import type { DependencyList } from 'react';

export interface UseFetchOptions {
  enabled?: boolean;
  deps?: DependencyList;
}

export interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refetch: (mode?: 'silent' | 'pull') => Promise<void>;
  setData: (updater: (prev: T | null) => T | null) => void;
}

export interface UseWeatherResult {
  weather: import('@/services/types').Weather | null;
  loading: boolean;
  coords: [number, number] | null;
}

export interface UseElapsedResult {
  elapsedSeconds: number;
}

export interface UseKeyboardAwareScrollResult {
  scrollRef: import('react').RefObject<import('react').ComponentRef<typeof import('react-native').ScrollView> | null>;
  keyboardHeight: number;
  onScroll: (e: import('react-native').NativeSyntheticEvent<import('react-native').NativeScrollEvent>) => void;
  /** Rola até o campo em foco (chamado pelo TextField ao ganhar foco). */
  scrollToFocused: () => void;
}

export interface SafeInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface LiveBroadcast {
  /** Começa a transmitir (só os pets de passeio entre `petIds`; sem nenhum, não faz nada). */
  start: (petIds: number[]) => void;
  /** Passeio salvo: avisa o pai/mãe de pet com o registro de cada pet. */
  finish: (saved: import('@/services/types').CreatedWalk) => Promise<void>;
  /** Passeio descartado. */
  cancel: () => void;
}
