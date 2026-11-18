import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components/native';
import { MiniRoute } from '@/components/MiniRoute';
import { PackBadge } from '@/components/PackBadge';
import { duration, km, pace, thousands } from '@/utils/format';
import {
  Band, BandStats, Bottom, Brand, BrandDot, BrandText, Cell, Corner, Fill, Grid, RouteLayer, Row, Scrim, Stack, StatLabel,
  StatValue,
} from './styles';
import type { PhotoOverlayProps, PhotoRouteProps, StatItem, StatProps } from './types';

/** Trajeto branco com contorno escuro translúcido: legível em céu claro ou grama escura. */
function PhotoRoute({ points, size, stroke }: PhotoRouteProps) {
  const theme = useTheme();
  return (
    <>
      <Stack><MiniRoute points={points} width={size} height={size} strokeWidth={stroke + 3} color={theme.colors.photoShadow} /></Stack>
      <MiniRoute points={points} width={size} height={size} strokeWidth={stroke} color={theme.colors.white} />
    </>
  );
}

function Stat({ label, value, big }: StatProps) {
  return (
    <>
      <StatLabel>{label}</StatLabel>
      <StatValue $big={big}>{value}</StatValue>
    </>
  );
}

/** Os números e o trajeto do passeio desenhados por cima da foto, no estilo escolhido. */
export function PhotoOverlay({ walk, petName, layout, width, height, premium }: PhotoOverlayProps) {
  const theme = useTheme();
  const stats: StatItem[] = [
    { label: 'Distância', value: `${km(walk.distance_meters)} km` },
    { label: 'Tempo', value: duration(walk.duration_seconds) },
    { label: 'Passos', value: thousands(walk.steps) },
    { label: 'Ritmo', value: `${pace(walk.duration_seconds, walk.distance_meters)} /km` },
  ];
  const brand = (
    <Brand>
      <BrandDot />
      <BrandText>PetMotion · {petName}</BrandText>
      {premium ? <PackBadge tone="onInk" /> : null}
    </Brand>
  );

  if (layout === 'band') {
    return (
      <Fill pointerEvents="none">
        <Band>
          <PhotoRoute points={walk.points} size={RFValue(72)} stroke={RFValue(2.5)} />
          <BandStats>
            <Row>
              {stats.slice(0, 3).map((s) => (
                <Cell key={s.label}><Stat {...s} /></Cell>
              ))}
            </Row>
            {brand}
          </BandStats>
        </Band>
      </Fill>
    );
  }

  if (layout === 'route') {
    const size = width * 0.62;
    return (
      <Fill pointerEvents="none">
        <Scrim colors={['transparent', theme.colors.photoScrim]} $edge="bottom" $height={height * 0.4} />
        <RouteLayer $top={height * 0.12} $left={(width - size) / 2}>
          <PhotoRoute points={walk.points} size={size} stroke={RFValue(4)} />
        </RouteLayer>
        <Bottom>
          <Row>
            <Stat {...stats[0]} big />
            <Stat {...stats[1]} big />
          </Row>
          {brand}
        </Bottom>
      </Fill>
    );
  }

  // 'stats': números no canto superior esquerdo e trajeto à direita (como no Strava)
  return (
    <Fill pointerEvents="none">
      <Scrim colors={[theme.colors.photoScrim, 'transparent']} $edge="top" $height={height * 0.45} />
      <Corner $align="left">
        <Grid>
          {stats.map((s) => (
            <Cell key={s.label}><Stat {...s} /></Cell>
          ))}
        </Grid>
      </Corner>
      <Corner $align="right">
        <PhotoRoute points={walk.points} size={width * 0.36} stroke={RFValue(3)} />
      </Corner>
      <Bottom>{brand}</Bottom>
    </Fill>
  );
}
