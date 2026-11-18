import type { LucideIcon } from 'lucide-react-native';

export type StatTone = 'surface' | 'sun' | 'sky' | 'blush' | 'ink';

export interface StatTileProps {
  icon: LucideIcon;
  label: string;
  value: number;
  format?: (n: number) => string;
  unit?: string;
  tone?: StatTone;
  index?: number;
}
