import { create } from 'zustand';
import { api } from '@/services/api';
import type { Pet } from '@/services/types';

interface PetsState {
  pets: Pet[];
  selectedId: number | null;
  loaded: boolean;
  load: () => Promise<void>;
  select: (id: number) => void;
  /** Aceita um convite de passeador, recarrega a lista e seleciona o pet novo. */
  adopt: (code: string) => Promise<Pet>;
  upsert: (pet: Pet) => void;
  remove: (id: number) => void;
  reset: () => void;
}

export const usePets = create<PetsState>((set, get) => ({
  pets: [],
  selectedId: null,
  loaded: false,

  load: async () => {
    const pets = await api.pets();
    const current = get().selectedId;
    const stillExists = pets.some((p) => p.id === current);
    set({ pets, loaded: true, selectedId: stillExists ? current : (pets[0]?.id ?? null) });
  },
  select: (id) => set({ selectedId: id }),
  adopt: async (code) => {
    const pet = await api.acceptInvite(code);
    await get().load();
    set({ selectedId: pet.id });
    return pet;
  },
  upsert: (pet) =>
    set((s) => {
      const exists = s.pets.some((p) => p.id === pet.id);
      return {
        pets: exists ? s.pets.map((p) => (p.id === pet.id ? pet : p)) : [...s.pets, pet],
        selectedId: exists ? s.selectedId : pet.id,
      };
    }),
  remove: (id) =>
    set((s) => {
      const pets = s.pets.filter((p) => p.id !== id);
      return { pets, selectedId: s.selectedId === id ? (pets[0]?.id ?? null) : s.selectedId };
    }),
  reset: () => set({ pets: [], selectedId: null, loaded: false }),
}));

export const useSelectedPet = () =>
  usePets((s) => s.pets.find((p) => p.id === s.selectedId) ?? null);
