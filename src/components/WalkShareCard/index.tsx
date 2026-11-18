import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { fullDateLabel, km, minutesLabel, thousands, timeLabel } from '@/utils/format';
import { MiniRoute } from '../MiniRoute';
import { PackBadge } from '../PackBadge';
import { PetAvatar } from '../PetAvatar';
import {
  Big, Brand, BrandDot, BrandText, Card, Header, HeaderTexts, Number, Numbers, PetName, RouteBox, Small, When,
} from './styles';
import type { WalkShareCardProps } from './types';

/** O card "estilo Strava" — é ele que vira imagem para compartilhar. */
export function WalkShareCard({ walk, pet, animated, premium }: WalkShareCardProps) {
  const [width, setWidth] = useState(0);
  const routeHeight = RFValue(170);

  return (
    <Card>
      <Header>
        <PetAvatar pet={pet} size={RFValue(46)} ring />
        <HeaderTexts>
          <PetName>Passeio do {pet.name}</PetName>
          <When>{fullDateLabel(walk.started_at)} · {timeLabel(walk.started_at)}</When>
        </HeaderTexts>
      </Header>

      <RouteBox onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 ? <MiniRoute points={walk.points} width={width} height={routeHeight} strokeWidth={RFValue(5)} animated={animated} /> : null}
      </RouteBox>

      <Numbers>
        <Number>
          <Big>{km(walk.distance_meters)}</Big>
          <Small>km</Small>
        </Number>
        <Number>
          <Big>{minutesLabel(Math.round(walk.duration_seconds / 60))}</Big>
          <Small>duração</Small>
        </Number>
        <Number>
          <Big>{thousands(walk.steps)}</Big>
          <Small>passos</Small>
        </Number>
      </Numbers>

      <Brand>
        <BrandDot />
        <BrandText>PetMotion</BrandText>
        {premium ? <PackBadge tone="onInk" /> : null}
      </Brand>
    </Card>
  );
}
