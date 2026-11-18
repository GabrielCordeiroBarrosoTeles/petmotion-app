import type { PressableProps, StyleProp, ViewStyle } from 'react-native';

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  /** Escala ao pressionar (padrão 0.96). */
  scaleTo?: number;
  haptic?: 'tap' | 'select' | 'none';
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}
