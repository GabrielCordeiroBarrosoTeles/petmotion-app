import type { BottomTabBarProps } from 'expo-router/tabs';
import type { LucideIcon } from 'lucide-react-native';

export type TabBarProps = BottomTabBarProps;

export interface TabMeta {
  label: string;
  icon: LucideIcon;
}
