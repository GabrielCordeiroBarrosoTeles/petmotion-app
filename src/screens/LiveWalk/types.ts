import type { LucideIcon } from 'lucide-react-native';
import type { WalkEventType } from '@/services/types';

export type LiveWalkParams = { id: string };

export interface LiveCountProps {
  type: WalkEventType;
  label: string;
  icon: LucideIcon;
  count: number;
}
