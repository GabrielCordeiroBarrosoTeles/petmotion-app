import { router } from 'expo-router';
import { useEffect } from 'react';
import { wear, type WatchAction, type WatchState } from '@/services/wear';
import { useSelectedPet } from '@/store/pets';
import { elapsedMs, useWalk } from '@/store/walk';
import { useWearCommand } from '@/store/wearCommand';

/** No máximo uma publicação por segundo (o GPS e o pedômetro mudam o tempo todo). */
export const PUBLISH_INTERVAL_MS = 1000;

export function toWatchState(walk: ReturnType<typeof useWalk.getState>, pet: string | null): WatchState {
  const count = (type: 'pee' | 'poop' | 'water') => walk.events.filter((e) => e.type === type).length;
  return {
    status: walk.status,
    pet,
    elapsedMs: elapsedMs(walk),
    at: Date.now(),
    distance: Math.round(walk.distance),
    steps: walk.steps,
    counts: { pee: count('pee'), poop: count('poop'), water: count('water') },
  };
}

/** O que cada toque do relógio faz no celular. */
export function handleWatchAction(action: WatchAction) {
  const walk = useWalk.getState();
  const walking = walk.status !== 'idle';

  if (action === 'pee' || action === 'poop' || action === 'water') {
    if (walking) walk.addEvent(action);
    return;
  }
  if (action === 'pause') {
    if (walk.status === 'running') walk.pause();
    return;
  }
  if (action === 'resume') {
    if (walk.status === 'paused') walk.resume();
    return;
  }
  // começar e finalizar passam pela tela do passeio (contagem, salvar e resumo)
  if (action === 'start' ? walking : !walking) return;
  router.navigate('/walk');
  useWearCommand.getState().send(action);
}

/**
 * Mantém o relógio em dia: publica o estado do passeio (no máximo 1x por segundo, sempre com o
 * último estado) e executa o que o relógio pedir. Sem relógio/módulo nativo, não faz nada.
 */
export function useWearSync() {
  const petName = useSelectedPet()?.name ?? null;

  useEffect(() => {
    if (!wear.available) return undefined;
    let last = 0;
    let pending: ReturnType<typeof setTimeout> | null = null;

    const publish = () => {
      pending = null;
      last = Date.now();
      wear.publish(toWatchState(useWalk.getState(), petName));
    };
    const schedule = () => {
      if (pending) return;
      const wait = PUBLISH_INTERVAL_MS - (Date.now() - last);
      if (wait <= 0) publish();
      else pending = setTimeout(publish, wait);
    };

    publish();
    const unsubscribe = useWalk.subscribe(schedule);
    return () => {
      unsubscribe();
      if (pending) clearTimeout(pending);
    };
  }, [petName]);

  useEffect(() => {
    const subscription = wear.onAction(handleWatchAction);
    return () => subscription.remove();
  }, []);
}
