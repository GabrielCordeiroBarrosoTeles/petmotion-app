import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, {
  Easing, useAnimatedProps, useReducedMotion, useSharedValue, withDelay, withTiming,
} from 'react-native-reanimated';
import { RFValue } from 'react-native-responsive-fontsize';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from 'styled-components/native';
import { TennisBall } from '@/components/TennisBall';
import { spring, timing } from '@/theme/motion';
import { thump } from '@/utils/haptics';
import {
  BallSlot, Brand, Layer, Letter, Overlay, Pin, Tagline, Word,
} from './styles';
import type { Point, SplashIntroProps } from './types';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const DASH = 3000;
const WORD = 'PetMotion'.split('');

/** Linha do tempo da abertura (ms). */
const TRAIL_DELAY = 100;
const TRAIL_MS = 1000;
const BALL_DELAY = 950;
const LANDING = 1250;
const LETTERS_DELAY = 1150;
const INTRO_MS = 1900;
const EXIT_MS = 760;

/** Ponto de uma curva de Bézier cúbica em t (0..1). */
export function bezier([p0, p1, p2, p3]: Point[], t: number): Point {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return { x: a * p0.x + b * p1.x + c * p2.x + d * p3.x, y: a * p0.y + b * p1.y + c * p2.y + d * p3.y };
}

/**
 * Abertura do app: a trilha do passeio se desenha subindo pela tela, as marcações
 * (xixi, cocô, água) pipocam pelo caminho, a bola cai no fim da trilha e o nome entra
 * letra por letra. Para sair, a bola cresce até cobrir a tela e some, revelando o app.
 */
export function SplashIntro({ ready, onFinish }: SplashIntroProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const [introDone, setIntroDone] = useState(false);
  const leaving = introDone && ready;

  const ballSize = RFValue(84);
  const curve: Point[] = [
    { x: -width * 0.1, y: height * 1.04 },
    { x: width * 0.2, y: height * 0.62 },
    { x: width * 1.05, y: height * 0.78 },
    { x: width / 2, y: height * 0.4 },
  ];
  const [start, c1, c2, end] = curve;
  const d = `M${start.x} ${start.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${end.x} ${end.y}`;
  const pins = [
    { t: 0.3, color: theme.colors.sun },
    { t: 0.55, color: theme.colors.earth },
    { t: 0.78, color: theme.colors.sky },
  ].map((pin) => ({ ...pin, ...bezier(curve, pin.t) }));
  // a bola precisa cobrir a tela inteira saindo do ponto onde pousou
  const cover = (Math.hypot(width, height) * 2) / ballSize;

  const progress = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) {
      progress.value = withDelay(TRAIL_DELAY, withTiming(1, { duration: TRAIL_MS, easing: Easing.inOut(Easing.cubic) }));
    }
  }, [reduced, progress]);
  const trailProps = useAnimatedProps(() => ({ strokeDashoffset: DASH * (1 - progress.value) }));

  useEffect(() => {
    if (reduced) {
      setIntroDone(true);
      return undefined;
    }
    const landing = setTimeout(thump, LANDING);
    const done = setTimeout(() => setIntroDone(true), INTRO_MS);
    return () => {
      clearTimeout(landing);
      clearTimeout(done);
    };
  }, [reduced]);

  useEffect(() => {
    if (!leaving) return undefined;
    const id = setTimeout(onFinish, reduced ? theme.motion.base : EXIT_MS);
    return () => clearTimeout(id);
  }, [leaving, reduced, onFinish, theme.motion.base]);

  const appear = (delay: number) => (reduced ? timing({ duration: 0 }) : timing({ duration: theme.motion.base, delay }));

  return (
    <Overlay
      testID="splash"
      accessibilityLabel="PetMotion. Cada passeio vira um mapa."
      accessibilityRole="image"
      from={{ opacity: 1 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={timing({ duration: theme.motion.base, delay: leaving && !reduced ? EXIT_MS - theme.motion.base : 0 })}
    >
      <StatusBar style="light" />
      <Layer
        pointerEvents="none"
        animate={{ opacity: leaving ? 0 : 1 }}
        transition={timing({ duration: theme.motion.fast })}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Svg width={width} height={height}>
          <AnimatedPath d={d} stroke={theme.colors.inkSoft} strokeWidth={RFValue(18)} strokeLinecap="round" fill="none" strokeDasharray={DASH} animatedProps={trailProps} />
          <AnimatedPath d={d} stroke={theme.colors.primary} strokeWidth={RFValue(5)} strokeLinecap="round" fill="none" strokeDasharray={DASH} animatedProps={trailProps} />
        </Svg>
        {pins.map((pin) => (
          <Pin
            key={pin.t}
            $x={pin.x}
            $y={pin.y}
            $color={pin.color}
            from={{ scale: reduced ? 1 : 0 }}
            animate={{ scale: 1 }}
            transition={reduced ? timing({ duration: 0 }) : spring({ ...theme.motion.springBouncy, delay: TRAIL_DELAY + TRAIL_MS * pin.t })}
          />
        ))}
        <Brand $top={end.y + ballSize / 2 + theme.spacing.large}>
          <Word>
            {WORD.map((letter, i) => (
              <Letter
                key={`${letter}${i}`}
                from={{ opacity: reduced ? 1 : 0, translateY: reduced ? 0 : RFValue(22) }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={reduced ? timing({ duration: 0 }) : spring({ ...theme.motion.spring, delay: LETTERS_DELAY + i * 40 })}
              >
                {letter}
              </Letter>
            ))}
          </Word>
          <Tagline from={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} transition={appear(LETTERS_DELAY + 420)}>
            Cada passeio vira um mapa.
          </Tagline>
        </Brand>
      </Layer>
      <BallSlot
        pointerEvents="none"
        $x={end.x}
        $y={end.y}
        $size={ballSize}
        from={{ translateY: reduced ? 0 : -(end.y + ballSize), scale: 1 }}
        animate={{ translateY: 0, scale: leaving && !reduced ? cover : 1 }}
        transition={
          leaving
            ? timing({ duration: EXIT_MS - 120 })
            : reduced ? timing({ duration: 0 }) : spring({ ...theme.motion.springBouncy, delay: BALL_DELAY })
        }
      >
        <TennisBall size={ballSize} />
      </BallSlot>
    </Overlay>
  );
}
