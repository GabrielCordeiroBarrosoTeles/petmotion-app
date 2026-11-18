import { PawPrint } from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components/native';
import { Label, Pill } from './styles';
import type { PackBadgeProps } from './types';

/** Selo da Matilha (plano premium). */
export function PackBadge({ tone = 'default' }: PackBadgeProps) {
  const theme = useTheme();
  const onInk = tone === 'onInk';
  return (
    <Pill $onInk={onInk} accessibilityLabel="Membro da Matilha">
      <PawPrint size={RFValue(11)} color={onInk ? theme.colors.ink : theme.colors.primary} strokeWidth={2.8} />
      <Label $onInk={onInk}>Matilha</Label>
    </Pill>
  );
}
