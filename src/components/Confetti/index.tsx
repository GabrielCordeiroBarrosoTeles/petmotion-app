import { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming,
} from 'react-native-reanimated';
import { useTheme } from 'styled-components/native';
import { Layer, Piece } from './styles';
import type { ConfettiProps, PieceProps } from './types';

function ConfettiPiece({ index, color, width }: PieceProps) {
  const { height } = useWindowDimensions();
  const t = useSharedValue(0);
  // valores "aleatórios" estáveis por índice
  const seed = Math.sin(index * 999) * 10000;
  const rand = seed - Math.floor(seed);
  const startX = (rand - 0.5) * width * 0.9;
  const drift = (Math.cos(index * 7) * width) / 3;
  const spin = 360 + rand * 720;

  useEffect(() => {
    t.value = withDelay(index * 18, withTiming(1, { duration: 1800 + rand * 900, easing: Easing.out(Easing.quad) }));
  }, [index, rand, t]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - Math.max(0, t.value - 0.75) * 4,
    transform: [
      { translateX: startX + drift * t.value },
      { translateY: t.value * height * 0.85 },
      { rotate: `${spin * t.value}deg` },
      { rotateX: `${t.value * 540}deg` },
    ],
  }));

  return <Piece $color={color} $round={index % 3 === 0} style={style} />;
}

export function Confetti({ burstKey, count = 42 }: ConfettiProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const reduced = useReducedMotion();
  const colors = [theme.colors.primary, theme.colors.sun, theme.colors.blush, theme.colors.sky, theme.colors.ink];

  if (!burstKey || reduced) return null;

  return (
    <Layer pointerEvents="none" key={burstKey}>
      {Array.from({ length: count }, (_, i) => (
        <ConfettiPiece key={i} index={i} color={colors[i % colors.length]} width={width} />
      ))}
    </Layer>
  );
}

