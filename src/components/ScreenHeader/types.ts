import type { LucideIcon } from 'lucide-react-native';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: { icon: LucideIcon; label: string; onPress: () => void };
}
