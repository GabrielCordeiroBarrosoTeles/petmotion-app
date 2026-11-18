import { create } from 'zustand';

interface SettingsState {
  /** Modo apresentação: simula o GPS andando (sala de aula costuma ter GPS ruim). */
  demoMode: boolean;
  walkReminder: boolean;
  setDemoMode: (value: boolean) => void;
  setWalkReminder: (value: boolean) => void;
}

export const useSettings = create<SettingsState>((set) => ({
  demoMode: false,
  walkReminder: false,
  setDemoMode: (demoMode) => set({ demoMode }),
  setWalkReminder: (walkReminder) => set({ walkReminder }),
}));
