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
