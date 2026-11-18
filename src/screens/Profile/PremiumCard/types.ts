import type { User } from '@/services/types';

export interface PremiumCardProps {
  user: Pick<User, 'is_premium' | 'premium_until' | 'trial_available'>;
  onPress: () => void;
}
