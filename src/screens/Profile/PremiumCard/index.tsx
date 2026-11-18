import { ChevronRight, PawPrint } from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components/native';
import { PackBadge } from '@/components/PackBadge';
import { PressableScale } from '@/components/PressableScale';
import { spring } from '@/theme/motion';
import { fullDateLabel } from '@/utils/format';
import { Body, Card, Paw, Texts, Title } from './styles';
import type { PremiumCardProps } from './types';

export function PremiumCard({ user, onPress }: PremiumCardProps) {
  const theme = useTheme();
  const member = user.is_premium;
  const title = member ? 'Você é da Matilha' : user.trial_available ? 'Entre para a Matilha' : 'Volte para a Matilha';
  const body = member
    ? `Ativa até ${fullDateLabel(user.premium_until!)}.`
    : user.trial_available
      ? '7 dias grátis · pets ilimitados e selo exclusivo'
      : 'Pets ilimitados e selo exclusivo de novo.';

  return (
    <PressableScale onPress={onPress} scaleTo={0.98} accessibilityLabel={`${title}. ${body}`}>
      <Card $member={member} from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={spring({ damping: 15 })}>
        <Paw>
          <PawPrint size={RFValue(26)} color={theme.colors.primary} strokeWidth={2.4} />
        </Paw>
        <Texts>
          {member ? <PackBadge /> : null}
          <Title>{title}</Title>
          <Body>{body}</Body>
        </Texts>
        <ChevronRight size={RFValue(22)} color={theme.colors.ink} />
      </Card>
    </PressableScale>
  );
}
