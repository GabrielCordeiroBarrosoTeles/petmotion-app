import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components/native';
import { AnimatedCounter } from '../AnimatedCounter';
import { Label, Tile, Top, Unit, ValueRow } from './styles';
import type { StatTileProps } from './types';
import { spring } from '@/theme/motion';

export function StatTile({ icon: Icon, label, value, format, unit, tone = 'surface', index = 0 }: StatTileProps) {
  const theme = useTheme();
  const onInk = tone === 'ink';

  return (
    <Tile
      $tone={tone}
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={spring({ damping: 16, delay: 70 * index })}
    >
      <Top>
        <Icon size={RFValue(16)} color={onInk ? theme.colors.primary : theme.colors.ink} strokeWidth={2.4} />
        <Label $onInk={onInk}>{label}</Label>
      </Top>
      <ValueRow>
        <AnimatedCounter value={value} format={format} onInk={onInk} />
        {unit ? <Unit $onInk={onInk}>{unit}</Unit> : null}
      </ValueRow>
    </Tile>
  );
}
