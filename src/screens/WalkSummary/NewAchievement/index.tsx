import { Trophy } from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components/native';
import { spring, timing } from '@/theme/motion';
import { Kicker, Medal, Row, Texts, Title } from './styles';
import type { NewAchievementProps } from './types';

export function NewAchievement({ achievement, index }: NewAchievementProps) {
  const theme = useTheme();
  return (
    <Row
      from={{ opacity: 0, scale: 0.8, translateY: 20 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={spring({ damping: 10, delay: 900 + index * 200 })}
      accessibilityLabel={`Nova conquista: ${achievement.title}. ${achievement.description}`}
    >
      <Medal
        from={{ rotate: '0deg' }}
        animate={{ rotate: ['0deg', '-14deg', '14deg', '-8deg', '0deg'] }}
        transition={timing({ duration: 900, delay: 1200 + index * 200 })}
      >
        <Trophy size={RFValue(22)} color={theme.colors.ink} strokeWidth={2.4} />
      </Medal>
      <Texts>
        <Kicker>Nova conquista desbloqueada</Kicker>
        <Title>{achievement.title}</Title>
      </Texts>
    </Row>
  );
}
