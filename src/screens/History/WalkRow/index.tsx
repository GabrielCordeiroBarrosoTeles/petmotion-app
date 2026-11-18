import { ChevronRight, Droplet, Droplets, Leaf } from 'lucide-react-native';
import { memo } from 'react';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components/native';
import { MiniRoute } from '@/components/MiniRoute';
import { PressableScale } from '@/components/PressableScale';
import { useAuth } from '@/store/auth';
import { spring } from '@/theme/motion';
import { km, minutesLabel, relativeDay, thousands, timeLabel } from '@/utils/format';
import { Card, Distance, Info, Mark, Marks, MarkText, Meta, ROUTE_SIZE, RouteTile, When } from './styles';
import type { WalkRowProps } from './types';

function WalkRowBase({ walk, index, onPress }: WalkRowProps) {
  const theme = useTheme();
  const me = useAuth((s) => s.user?.id);
  const count = (type: string) => walk.events.filter((e) => e.type === type).length;
  const marks = [
    { type: 'pee', icon: Droplet, color: theme.colors.sunSoft },
    { type: 'poop', icon: Leaf, color: theme.colors.earthSoft },
    { type: 'water', icon: Droplets, color: theme.colors.skySoft },
  ].filter((m) => count(m.type) > 0);
  const minutes = Math.round(walk.duration_seconds / 60);

  return (
    <PressableScale
      onPress={() => onPress(walk)}
      scaleTo={0.98}
      accessibilityLabel={`Passeio de ${relativeDay(walk.started_at)}, ${km(walk.distance_meters)} quilômetros em ${minutes} minutos`}
    >
      <Card from={{ opacity: 0, translateY: 18 }} animate={{ opacity: 1, translateY: 0 }} transition={spring({ damping: 16, delay: Math.min(index, 8) * 50 })}>
        <RouteTile>
          <MiniRoute points={walk.points} width={ROUTE_SIZE - RFValue(10)} height={ROUTE_SIZE - RFValue(10)} strokeWidth={RFValue(3)} />
        </RouteTile>
        <Info>
          <When>{relativeDay(walk.started_at)} · {timeLabel(walk.started_at)}</When>
          <Distance>{km(walk.distance_meters)} km</Distance>
          <Meta>{minutesLabel(minutes)} · {thousands(walk.steps)} passos</Meta>
          {walk.walker && walk.walker.id !== me ? <Meta>com {walk.walker.name}</Meta> : null}
          {marks.length ? (
            <Marks>
              {marks.map(({ type, icon: Icon, color }) => (
                <Mark key={type} $color={color}>
                  <Icon size={RFValue(11)} color={theme.colors.ink} strokeWidth={2.6} />
                  <MarkText>{count(type)}</MarkText>
                </Mark>
              ))}
            </Marks>
          ) : null}
        </Info>
        <ChevronRight size={RFValue(20)} color={theme.colors.textMuted} />
      </Card>
    </PressableScale>
  );
}

export const WalkRow = memo(WalkRowBase);
