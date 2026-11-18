import type { Pet } from '@/services/types';

export interface PetRowProps {
  pet: Pet;
  index: number;
  onPress: (pet: Pet) => void;
}
