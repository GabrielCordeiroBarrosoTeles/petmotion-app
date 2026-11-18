import { Badge, Body, Box, Temp, Texts, Title } from './styles';
import type { WeatherBannerProps } from './types';
import { spring } from '@/theme/motion';

const TITLES = {
  safe: 'Chão tranquilo para as patas',
  warning: 'Chão morno, atenção',
  danger: 'Asfalto quente demais',
};

export function WeatherBanner({ weather }: WeatherBannerProps) {
  return (
    <Box
      $level={weather.level}
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={spring({ damping: 16 })}
      accessibilityRole="summary"
      accessibilityLabel={`${TITLES[weather.level]}. Asfalto estimado em ${weather.asphalt_c} graus, ar a ${Math.round(weather.air_c)} graus. ${weather.message}`}
    >
      <Badge $level={weather.level}>
        <Temp>{weather.asphalt_c}°</Temp>
      </Badge>
      <Texts>
        <Title>{TITLES[weather.level]}</Title>
        <Body>
          Asfalto ~{weather.asphalt_c}°C · ar {Math.round(weather.air_c)}°C. {weather.message}
        </Body>
      </Texts>
    </Box>
  );
}
