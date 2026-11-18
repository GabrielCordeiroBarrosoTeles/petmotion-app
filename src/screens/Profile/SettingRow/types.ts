import type { LucideIcon } from 'lucide-react-native';

export interface SettingRowProps {
  icon: LucideIcon;
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}
