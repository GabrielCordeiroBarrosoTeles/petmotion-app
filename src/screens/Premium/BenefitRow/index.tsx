import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components/native';
import { spring } from '@/theme/motion';
import { Description, IconTile, Row, Soon, Texts, Title, TitleRow } from './styles';
import type { BenefitRowProps } from './types';

export function BenefitRow({ icon: Icon, title, description, soon = false, index }: BenefitRowProps) {
  const theme = useTheme();
  return (
    <Row
      from={{ opacity: 0, translateX: -24 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={spring({ damping: 15, delay: 350 + index * 110 })}
      accessibilityLabel={`${title}${soon ? ', em breve' : ''}. ${description}`}
    >
      <IconTile $soon={soon}>
        <Icon size={RFValue(22)} color={soon ? theme.colors.onInkMuted : theme.colors.ink} strokeWidth={2.4} />
      </IconTile>
      <Texts>
        <TitleRow>
          <Title>{title}</Title>
          {soon ? <Soon>Em breve</Soon> : null}
        </TitleRow>
        <Description>{description}</Description>
      </Texts>
    </Row>
  );
}
