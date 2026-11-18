import type { LucideIcon } from 'lucide-react-native';

export interface HoldToConfirmProps {
  label: string;
  holdingLabel?: string;
  icon?: LucideIcon;
  onConfirm: () => void;
  durationMs?: number;
}
