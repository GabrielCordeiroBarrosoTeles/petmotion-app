import { useReducedMotion } from 'react-native-reanimated';
import { timing } from '@/theme/motion';
import { Ball, Seam, Shadow, Stage } from './styles';
import type { BouncingBallProps } from './types';

/** A bola de tênis quicando: o símbolo do app. */
export function BouncingBall({ size, delay = 0 }: BouncingBallProps) {
  const reduced = useReducedMotion();
  const loop = timing({ duration: 520, loop: true, repeatReverse: true, delay });

  return (
    <Stage $size={size} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Ball
        $size={size}
        from={{ translateY: -size * 1.2, scaleY: 1, scaleX: 1 }}
        animate={reduced ? {} : { translateY: 0, scaleY: 0.86, scaleX: 1.1 }}
        transition={loop}
      >
        <Seam $size={size} $side="left" />
        <Seam $size={size} $side="right" />
      </Ball>
      <Shadow $size={size} from={{ scale: 0.5, opacity: 0.3 }} animate={reduced ? {} : { scale: 1, opacity: 0.8 }} transition={loop} />
    </Stage>
  );
}
