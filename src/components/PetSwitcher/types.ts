import type { Pet } from '@/services/types';

export interface PetSwitcherProps {
  pets: Pet[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAdd: () => void;
}
