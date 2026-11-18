import type { LucideIcon } from 'lucide-react-native';

export type ButtonVariant = 'primary' | 'ink' | 'ghost' | 'danger';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  compact?: boolean;
  accessibilityHint?: string;
}

export interface ButtonStyleProps {
  $variant: ButtonVariant;
  $disabled?: boolean;
  $compact?: boolean;
}
