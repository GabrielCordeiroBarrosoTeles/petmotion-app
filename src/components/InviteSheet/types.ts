import type { Pet } from '@/services/types';

export interface InviteSheetProps {
  pet: Pet;
  visible: boolean;
  onClose: () => void;
}
