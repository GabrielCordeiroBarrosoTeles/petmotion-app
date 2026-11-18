import type { Pet, Walk } from '@/services/types';

export interface WalkShareCardProps {
  walk: Walk;
  pet: Pick<Pet, 'name' | 'species' | 'photo_url'>;
  animated?: boolean;
  /** Mostra o selo da Matilha (membro premium). */
  premium?: boolean;
}
