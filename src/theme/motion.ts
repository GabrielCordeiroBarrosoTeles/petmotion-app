import type { MotiTransitionProp } from 'moti';

/**
 * Moti 0.30 tipa `transition` contra o Reanimated 3; com o Reanimated 4 o TS rejeita
 * configs válidas. Estes helpers centralizam o cast (o runtime é o mesmo).
 */
interface SpringConfig {
  damping?: number;
  stiffness?: number;
  mass?: number;
  delay?: number;
}

interface TimingConfig {
  duration?: number;
  delay?: number;
  loop?: boolean;
  repeatReverse?: boolean;
}

export const spring = (config: SpringConfig) => ({ type: 'spring', ...config }) as unknown as MotiTransitionProp;
export const timing = (config: TimingConfig) => ({ type: 'timing', ...config }) as unknown as MotiTransitionProp;
