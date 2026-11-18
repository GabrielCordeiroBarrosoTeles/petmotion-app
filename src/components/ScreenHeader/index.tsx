import { ChevronLeft } from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components/native';
import { PressableScale } from '../PressableScale';
import { IconButton, Row, Subtitle, Texts, Title } from './styles';
import type { ScreenHeaderProps } from './types';

export function ScreenHeader({ title, subtitle, onBack, action }: ScreenHeaderProps) {
  const theme = useTheme();
  const ActionIcon = action?.icon;

  return (
    <Row>
      {onBack ? (
        <PressableScale onPress={onBack} accessibilityLabel="Voltar" hitSlop={8}>
          <IconButton>
            <ChevronLeft size={RFValue(24)} color={theme.colors.ink} />
          </IconButton>
        </PressableScale>
      ) : null}
      <Texts>
        <Title accessibilityRole="header" numberOfLines={1}>{title}</Title>
        {subtitle ? <Subtitle numberOfLines={1}>{subtitle}</Subtitle> : null}
      </Texts>
      {action && ActionIcon ? (
        <PressableScale onPress={action.onPress} accessibilityLabel={action.label} hitSlop={8}>
          <IconButton $filled>
            <ActionIcon size={RFValue(22)} color={theme.colors.primary} strokeWidth={2.6} />
          </IconButton>
        </PressableScale>
      ) : null}
    </Row>
  );
}
