import { initialWindowMetrics, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SafeInsets } from './types';

/**
 * Áreas seguras confiáveis. Em telas modais do Android (modal/fullScreenModal) o
 * useSafeAreaInsets devolve 0 em cima e embaixo, e o conteúdo fica atrás da barra de
 * status e dos botões do sistema. Aqui usamos o maior entre o valor da tela e a medida
 * da janela feita na abertura do app.
 */
export function useSafeInsets(): SafeInsets {
  const insets = useSafeAreaInsets();
  const initial = initialWindowMetrics?.insets;
  return {
    top: Math.max(insets.top, initial?.top ?? 0),
    bottom: Math.max(insets.bottom, initial?.bottom ?? 0),
    left: insets.left,
    right: insets.right,
  };
}
