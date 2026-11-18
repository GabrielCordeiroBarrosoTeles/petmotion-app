import { create } from 'zustand';

/** Pedidos do relógio que precisam da tela do passeio (contagem 3-2-1, salvar e abrir o resumo). */
export type WearCommandType = 'start' | 'finish';

interface WearCommandState {
  command: { type: WearCommandType; id: number } | null;
  send: (type: WearCommandType) => void;
  clear: () => void;
}

let nextId = 0;

export const useWearCommand = create<WearCommandState>((set) => ({
  command: null,
  send: (type) => {
    nextId += 1;
    set({ command: { type, id: nextId } });
  },
  clear: () => set({ command: null }),
}));
