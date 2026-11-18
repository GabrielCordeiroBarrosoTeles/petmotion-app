import { timing } from '@/theme/motion';
import { Ball, Center, Seam } from './styles';
import type { TennisBallProps } from './types';

/** A bola de tênis da marca, com as costuras. O conteúdo (ícone, texto) fica por cima, sem girar. */
export function TennisBall({ size, spinning = false, children }: TennisBallProps) {
  return (
    <>
      <Ball
        $size={size}
        from={{ rotate: '0deg' }}
        animate={{ rotate: spinning ? '360deg' : '-18deg' }}
        transition={spinning ? timing({ duration: 6000, loop: true }) : timing({ duration: 400 })}
      >
        <Seam $size={size} $side="left" />
        <Seam $size={size} $side="right" />
      </Ball>
      <Center pointerEvents="none">{children}</Center>
    </>
  );
}
