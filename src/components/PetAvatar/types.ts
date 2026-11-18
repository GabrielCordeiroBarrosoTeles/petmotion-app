import type { Pet } from '@/services/types';

export interface PetAvatarProps {
  pet: Pick<Pet, 'name' | 'species' | 'photo_url'>;
  size: number;
  ring?: boolean;
}
