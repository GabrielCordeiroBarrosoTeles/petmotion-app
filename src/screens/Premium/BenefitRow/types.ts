import type { LucideIcon } from 'lucide-react-native';

export interface BenefitRowProps {
  icon: LucideIcon;
  title: string;
  description: string;
  soon?: boolean;
  index: number;
}
