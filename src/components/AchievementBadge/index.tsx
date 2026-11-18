import {
  Award, CalendarCheck, Flame, Footprints, Heart, Lock, Map, Moon, Sunrise, Trophy, type LucideIcon,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components/native';
import { PressableScale } from '../PressableScale';
import { Card, Fill, Medal, Title, Track } from './styles';
import type { AchievementBadgeProps } from './types';
import { spring, timing } from '@/theme/motion';

const ICONS: Record<string, LucideIcon> = {
  footprints: Footprints,
  flame: Flame,
  'calendar-check': CalendarCheck,
  map: Map,
  trophy: Trophy,
  sunrise: Sunrise,
  moon: Moon,
  heart: Heart,
};

export function AchievementBadge({ achievement, index, onPress }: AchievementBadgeProps) {
  const theme = useTheme();
  const Icon = achievement.unlocked ? (ICONS[achievement.icon] ?? Award) : Lock;

  return (
    <PressableScale
      onPress={() => onPress?.(achievement)}
      accessibilityLabel={`${achievement.title}: ${achievement.description}. ${achievement.unlocked ? 'Conquistada' : `${Math.round(achievement.progress * 100)}%`}`}
    >
      <MotiView
        from={{ opacity: 0, translateY: 16, rotate: '-6deg' }}
        animate={{ opacity: 1, translateY: 0, rotate: '0deg' }}
        transition={spring({ damping: 12, delay: 60 * index })}
      >
        <Card $unlocked={achievement.unlocked}>
          <MotiView
            animate={achievement.unlocked ? { rotate: ['0deg', '-10deg', '10deg', '0deg'] } : {}}
            transition={timing({ duration: 500, delay: 400 + 60 * index })}
          >
            <Medal $unlocked={achievement.unlocked}>
              <Icon size={RFValue(26)} color={achievement.unlocked ? theme.colors.ink : theme.colors.textMuted} strokeWidth={2.2} />
            </Medal>
          </MotiView>
          <Title $unlocked={achievement.unlocked} numberOfLines={1}>{achievement.title}</Title>
          {achievement.unlocked ? null : (
            <Track>
              <Fill $progress={achievement.progress} />
            </Track>
          )}
        </Card>
      </MotiView>
    </PressableScale>
  );
}
