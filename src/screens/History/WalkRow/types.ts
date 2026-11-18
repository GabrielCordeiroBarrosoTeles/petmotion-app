import type { Walk } from '@/services/types';

export interface WalkRowProps {
  walk: Walk;
  index: number;
  onPress: (walk: Walk) => void;
}
