import { useEffect, useState } from 'react';
import { elapsedMs, useWalk } from '@/store/walk';
import type { UseElapsedResult } from './types';

/** Re-renderiza a cada segundo enquanto o passeio está rodando. */
export function useElapsed(): UseElapsedResult {
  const status = useWalk((s) => s.status);
  const accumulatedMs = useWalk((s) => s.accumulatedMs);
  const resumedAt = useWalk((s) => s.resumedAt);
  const [, force] = useState(0);

  useEffect(() => {
    if (status !== 'running') return;
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  return { elapsedSeconds: Math.floor(elapsedMs({ accumulatedMs, resumedAt }) / 1000) };
}
