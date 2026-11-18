import { useState } from 'react';
import { Pressable } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from 'styled-components/native';
import { celebrate, tap } from '@/utils/haptics';
import { Content, Fill, Label, Shell } from './styles';
import type { HoldToConfirmProps } from './types';

/** "Segure para finalizar": evita encerrar o passeio sem querer, com barra enchendo. */
export function HoldToConfirm({ label, holdingLabel = 'Continue segurando…', icon: Icon, onConfirm, durationMs = 1200 }: HoldToConfirmProps) {
  const theme = useTheme();
  const progress = useSharedValue(0);
  const [holding, setHolding] = useState(false);

  const done = () => {
    setHolding(false);
    celebrate();
    onConfirm();
  };

  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Toque duas vezes e segure para confirmar"
      onPressIn={() => {
        tap();
        setHolding(true);
        progress.value = withTiming(1, { duration: durationMs, easing: Easing.linear }, (finished) => {
          if (finished) runOnJS(done)();
        });
      }}
      onPressOut={() => {
        if (progress.value < 1) {
          setHolding(false);
          progress.value = withTiming(0, { duration: 250 });
        }
      }}
      onAccessibilityAction={onConfirm}
    >
      <Shell>
        <Fill style={fillStyle} />
        <Content>
          {Icon ? <Icon size={RFValue(18)} color={theme.colors.onInk} strokeWidth={2.6} /> : null}
          <Label>{holding ? holdingLabel : label}</Label>
        </Content>
      </Shell>
    </Pressable>
  );
}
