import { Minus, Plus } from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components/native';
import { PressableScale } from '@/components/PressableScale';
import { spring } from '@/theme/motion';
import { Box, Center, Container, Label, Step, Unit, Value } from './styles';
import type { GoalStepperProps } from './types';

export function GoalStepper({ value, onChange, min = 10, max = 180, step = 5 }: GoalStepperProps) {
  const theme = useTheme();
  const canDown = value > min;
  const canUp = value < max;

  return (
    <Container>
      <Label>Meta diária de passeio</Label>
      <Box accessibilityRole="adjustable" accessibilityLabel="Meta diária" accessibilityValue={{ text: `${value} minutos` }}>
        <PressableScale haptic="select" disabled={!canDown} onPress={() => onChange(Math.max(min, value - step))} accessibilityLabel="Diminuir meta">
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
        <PressableScale haptic="select" disabled={!canUp} onPress={() => onChange(Math.min(max, value + step))} accessibilityLabel="Aumentar meta">
          <Step $disabled={!canUp}>
            <Plus size={RFValue(22)} color={theme.colors.ink} strokeWidth={3} />
          </Step>
        </PressableScale>
      </Box>
    </Container>
  );
}
