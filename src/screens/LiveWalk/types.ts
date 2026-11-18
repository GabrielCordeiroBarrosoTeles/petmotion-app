import type { LucideIcon } from 'lucide-react-native';
import type { WalkEventType } from '@/services/types';

export type LiveWalkParams = { id: string };

export interface LiveCountProps {
  type: WalkEventType;
  label: string;
  icon: LucideIcon;
  count: number;
}

export interface LiveClock {
  /** Tempo de passeio a mostrar. */
  seconds: number;
  /** Há quanto tempo não chega atualização, quando passa de 30 s (senão 0). */
  staleMs: number;
}
