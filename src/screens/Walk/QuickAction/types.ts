import type { LucideIcon } from 'lucide-react-native';
import type { WalkEventType } from '@/services/types';

export interface QuickActionProps {
  type: WalkEventType;
  label: string;
  icon: LucideIcon;
  count: number;
  onPress: (type: WalkEventType) => boolean;
}
