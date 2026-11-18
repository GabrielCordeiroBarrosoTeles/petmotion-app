import { create } from 'zustand';
import type { LiveWalk } from '@/services/types';

interface LiveState {
  /** Último estado ao vivo de cada pet meu (só os pets de que sou pai/mãe). */
  byPet: Record<number, LiveWalk>;
  /** Troca o estado inteiro (resposta do GET live, que traz a rota completa). */
  set: (petId: number, state: LiveWalk) => void;
  /** Aplica um evento do socket: na mesma sessão, os pontos novos entram no fim da rota. */
  apply: (petId: number, event: LiveWalk) => void;
  clear: (petId: number) => void;
  /**
   * Aplica a resposta do GET live sem atropelar o socket: ignora se já há um evento mais novo da
   * mesma sessão; "nenhum passeio" só limpa se nada chegou desde que o pedido saiu (`before`).
   */
  reconcile: (petId: number, state: LiveWalk | null, before: LiveWalk | undefined) => void;
  reset: () => void;
}

/** Junta o evento ao estado anterior. Sessão nova começa do zero. */
export function mergeLive(prev: LiveWalk | undefined, event: LiveWalk): LiveWalk {
  const { new_points: newPoints = [], ...rest } = event;
  const sameSession = prev?.session === event.session;
  const base = sameSession ? prev : undefined;
  return { ...base, ...rest, points: [...(base?.points ?? []), ...newPoints], truncated: event.truncated };
}

export const useLive = create<LiveState>((set, get) => ({
  byPet: {},
  set: (petId, state) => set((s) => ({ byPet: { ...s.byPet, [petId]: state } })),
  apply: (petId, event) => set((s) => ({ byPet: { ...s.byPet, [petId]: mergeLive(s.byPet[petId], event) } })),
  clear: (petId) =>
    set((s) => {
      const { [petId]: _removed, ...byPet } = s.byPet;
      return { byPet };
    }),
  reconcile: (petId, state, before) => {
    const current = get().byPet[petId];
    if (!state) {
      if (current === before) get().clear(petId);
      return;
    }
    if (current?.session === state.session && Date.parse(current.at) > Date.parse(state.at)) return;
    get().set(petId, state);
  },
  reset: () => set({ byPet: {} }),
}));

/** Passeio acontecendo agora (rodando ou pausado). */
export const isLiveActive = (state?: LiveWalk | null): state is LiveWalk =>
  state?.status === 'running' || state?.status === 'paused';
