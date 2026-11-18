import { useEffect } from 'react';
import Animated, { Easing, useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from 'styled-components/native';
import { Center, RotatedSvg, Wrapper } from './styles';
import type { ProgressRingProps } from './types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ProgressRing({ progress, size, stroke = 14, color, track, children }: ProgressRingProps) {
  const theme = useTheme();
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = useSharedValue(0);

  useEffect(() => {
    value.value = withDelay(200, withTiming(Math.min(1, Math.max(0, progress)), { duration: 1100, easing: Easing.out(Easing.cubic) }));
  }, [progress, value]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - value.value),
  }));

  return (
    <Wrapper $size={size} accessible accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}>
      <RotatedSvg>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke={track ?? theme.colors.inkLine} strokeWidth={stroke} fill="none" />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color ?? theme.colors.primary}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
          />
        </Svg>
      </RotatedSvg>
      <Center>{children}</Center>
    </Wrapper>
  );
}
