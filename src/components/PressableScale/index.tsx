import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { theme } from '@/theme';
import { select, tap } from '@/utils/haptics';
import { AnimatedPressable } from './styles';
import type { PressableScaleProps } from './types';

/** Pressable com "afundar" em mola + háptico: o feedback tátil base de todo o app. */
export function PressableScale({ scaleTo = 0.96, haptic = 'tap', style, onPressIn, onPressOut, onPress, children, ...rest }: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      {...rest}
      accessibilityRole={rest.accessibilityRole ?? 'button'}
      style={[style, animatedStyle]}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, theme.motion.spring);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, theme.motion.springBouncy);
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic === 'tap') tap();
        if (haptic === 'select') select();
        onPress?.(e);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}
