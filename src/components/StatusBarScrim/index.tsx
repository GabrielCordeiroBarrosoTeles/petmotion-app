import { useSafeInsets } from '@/hooks/useSafeInsets';
import { Scrim } from './styles';
import type { StatusBarScrimProps } from './types';

/** Fundo fixo atrás da barra de status: o conteúdo rolado nunca passa por baixo do relógio. */
export function StatusBarScrim({ tone }: StatusBarScrimProps) {
  const insets = useSafeInsets();
  return <Scrim testID="status-bar-scrim" $height={insets.top} $tone={tone} pointerEvents="none" />;
}
