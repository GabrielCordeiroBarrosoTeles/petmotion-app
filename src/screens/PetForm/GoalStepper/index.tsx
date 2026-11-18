import { Minus, Plus } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components/native';
import { PressableScale } from '@/components/PressableScale';
import { spring } from '@/theme/motion';
import { select } from '@/utils/haptics';
import { Box, Center, Container, Label, Step, Unit, Value } from './styles';
import type { GoalStepperProps } from './types';

/** Segurar começa a repetir depois deste tempo e acelera até o intervalo mínimo. */
const HOLD_DELAY_MS = 380;
const MIN_INTERVAL_MS = 60;
const ACCELERATION = 0.8;

export function GoalStepper({ value, onChange, min = 10, max = 180, step = 5 }: GoalStepperProps) {
  const theme = useTheme();
  const valueRef = useRef(value);
  valueRef.current = value;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeated = useRef(false);

  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);

  /** Dá um passo; devolve false quando já está no limite. */
  const stepBy = (direction: 1 | -1) => {
    const next = Math.min(max, Math.max(min, valueRef.current + direction * step));
    if (next === valueRef.current) return false;
    valueRef.current = next;
    select();
    onChange(next);
    return true;
  };

  const startHold = (direction: 1 | -1) => {
    stop();
    repeated.current = false;
    let delay = HOLD_DELAY_MS;
    const tick = () => {
      if (!stepBy(direction)) return stop();
      repeated.current = true;
      delay = Math.max(MIN_INTERVAL_MS, delay * ACCELERATION);
      timer.current = setTimeout(tick, delay);
    };
    timer.current = setTimeout(tick, delay);
  };

  const handlers = (direction: 1 | -1) => ({
    onPressIn: () => startHold(direction),
    onPressOut: stop,
    // toque simples: um passo. Se já repetiu segurando, soltar não conta mais um.
    onPress: () => {
      if (!repeated.current) stepBy(direction);
    },
  });

  const canDown = value > min;
  const canUp = value < max;

  return (
    <Container>
      <Label>Meta diária de passeio</Label>
      <Box accessibilityRole="adjustable" accessibilityLabel="Meta diária" accessibilityValue={{ text: `${value} minutos` }}>
        <PressableScale haptic="none" disabled={!canDown} {...handlers(-1)} accessibilityLabel="Diminuir meta" accessibilityHint="Segure para diminuir rápido">
          <Step $disabled={!canDown}>
            <Minus size={RFValue(22)} color={theme.colors.ink} strokeWidth={3} />
          </Step>
        </PressableScale>
        <Center>
          <Value key={value} from={{ scale: 0.7, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} transition={spring({ damping: 10 })}>
            {value}
          </Value>
          <Unit>minutos por dia</Unit>
        </Center>
        <PressableScale haptic="none" disabled={!canUp} {...handlers(1)} accessibilityLabel="Aumentar meta" accessibilityHint="Segure para aumentar rápido">
          <Step $disabled={!canUp}>
            <Plus size={RFValue(22)} color={theme.colors.ink} strokeWidth={3} />
          </Step>
        </PressableScale>
      </Box>
    </Container>
  );
}
