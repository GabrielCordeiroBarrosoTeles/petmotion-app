import type { TextProps } from 'react-native';

export type CounterVariant = 'hero' | 'stat' | 'inline';

export interface AnimatedCounterProps extends TextProps {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  variant?: CounterVariant;
  onInk?: boolean;
}
