import { create } from 'zustand';

export type ToastType = 'danger' | 'warning' | 'success';

interface ToastState {
  current: { id: number; message: string; type: ToastType } | null;
  show: (message: string, type: ToastType) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  current: null,
  show: (message, type) => set({ current: { id: Date.now(), message, type } }),
  hide: () => set({ current: null }),
}));
