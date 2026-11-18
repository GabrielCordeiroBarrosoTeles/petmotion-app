import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback } from 'react';

/** Telas com topo escuro (pinheiro) trocam a status bar enquanto estão em foco. */
export function useStatusBar(style: 'light' | 'dark') {
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(style, true);
      return () => setStatusBarStyle('dark', true);
    }, [style]),
  );
}
