import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '@/services/api';
import type { UseFetchOptions, UseFetchResult } from './types';

/**
 * Busca com estados de loading (primeira carga → skeleton), refreshing (pull to refresh)
 * e recarga silenciosa sempre que a tela volta ao foco.
 */
export function useFetch<T>(fetcher: () => Promise<T>, { enabled = true, deps = [] }: UseFetchOptions = {}): UseFetchResult<T> {
  const [data, setDataState] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const firstFocus = useRef(true);

  const run = useCallback(async (mode: 'initial' | 'silent' | 'pull') => {
    if (mode === 'initial') setLoading(true);
    if (mode === 'pull') setRefreshing(true);
    try {
      setDataState(await fetcherRef.current());
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setDataState(null);
    run('initial');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, run, ...deps]);

  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      if (enabled) run('silent');
    }, [enabled, run]),
  );

  const refetch = useCallback((mode: 'silent' | 'pull' = 'silent') => run(mode), [run]);
  const setData = useCallback((updater: (prev: T | null) => T | null) => setDataState(updater), []);

  return { data, loading, refreshing, error, refetch, setData };
}
