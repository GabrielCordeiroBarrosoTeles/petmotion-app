import type { Pet } from '@/services/types';

export interface CrewPickerProps {
  /** Todos os pets que o usuário pode passear (dele e de quem convidou). */
  pets: Pet[];
  checkedIds: number[];
  onToggle: (id: number) => void;
}

export interface CrewGroup {
  key: string;
  title: string;
  pets: Pet[];
}
