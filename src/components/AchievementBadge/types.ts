import type { Achievement } from '@/services/types';

export interface AchievementBadgeProps {
  achievement: Achievement;
  index: number;
  onPress?: (a: Achievement) => void;
}
