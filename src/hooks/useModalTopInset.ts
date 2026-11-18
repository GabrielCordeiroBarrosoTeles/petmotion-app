import { Platform } from 'react-native';
import { useSafeInsets } from './useSafeInsets';

/**
 * Espaço do topo para telas abertas como modal.
 * No Android o modal ocupa a tela toda (precisa da área da barra de status);
 * no iOS ele já abre como folha abaixo da barra, então não precisa.
 */
export function useModalTopInset(): number {
  const { top } = useSafeInsets();
  return Platform.OS === 'android' ? top : 0;
}
