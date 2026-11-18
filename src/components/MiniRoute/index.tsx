import { useEffect } from 'react';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from 'styled-components/native';
import { projectRoute } from '@/utils/geo';
import { Frame } from './styles';
import type { MiniRouteProps } from './types';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const DASH = 4000;

export function MiniRoute({ points, width, height, color, strokeWidth = 4, animated }: MiniRouteProps) {
  const theme = useTheme();
  const d = projectRoute(points, width, height, strokeWidth * 2);
  const progress = useSharedValue(animated ? 0 : 1);

  useEffect(() => {
    if (animated) progress.value = withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.cubic) });
  }, [animated, progress]);

  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: DASH * (1 - progress.value) }));
  // o caminho sempre começa com "Mx y": o primeiro par é o ponto de partida
  const [startX, startY] = d.slice(1).split(' ');

  return (
    <Frame $w={width} $h={height} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {d ? (
        <Svg width={width} height={height}>
          <AnimatedPath
            d={d}
            stroke={color ?? theme.colors.primary}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={DASH}
            animatedProps={animatedProps}
          />
          <Circle cx={Number(startX)} cy={Number(startY)} r={strokeWidth * 1.3} fill={theme.colors.onInk} />
        </Svg>
      ) : null}
    </Frame>
  );
}
