import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components/native';
import { select } from '@/utils/haptics';
import { Description, IconBox, Row, Texts, Title, Toggle } from './styles';
import type { SettingRowProps } from './types';

export function SettingRow({ icon: Icon, title, description, value, onChange }: SettingRowProps) {
  const theme = useTheme();
  return (
    <Row>
      <IconBox $on={value}>
        <Icon size={RFValue(20)} color={theme.colors.ink} strokeWidth={2.4} />
      </IconBox>
      <Texts>
        <Title>{title}</Title>
        <Description>{description}</Description>
      </Texts>
      <Toggle
        value={value}
        onValueChange={(v: boolean) => {
          select();
          onChange(v);
        }}
        accessibilityLabel={title}
      />
    </Row>
  );
}
