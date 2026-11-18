import type { LucideIcon } from 'lucide-react-native';
import { create } from 'zustand';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  icon: LucideIcon;
  /** danger = ação destrutiva (vermelho); ink = confirmação comum (bola). */
  tone?: 'danger' | 'ink';
}

interface ConfirmState {
  current: (ConfirmOptions & { id: number }) | null;
  resolve: ((ok: boolean) => void) | null;
  ask: (options: ConfirmOptions) => Promise<boolean>;
  answer: (ok: boolean) => void;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  current: null,
  resolve: null,
  ask: (options) =>
    new Promise<boolean>((resolve) => {
      get().resolve?.(false); // uma pergunta nova cancela a anterior
      set({ current: { ...options, id: Date.now() }, resolve });
    }),
  answer: (ok) => {
    get().resolve?.(ok);
    set({ current: null, resolve: null });
  },
}));
