import { useState } from 'react';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components/native';
import { PressableScale } from '@/components/PressableScale';
import { spring, timing } from '@/theme/motion';
import { thump } from '@/utils/haptics';
import { customToast } from '@/utils/toast';
import { Circle, Count, CountText, Label, Ripple, Wrapper } from './styles';
import type { QuickActionProps } from './types';

export function QuickAction({ type, label, icon: Icon, count, onPress }: QuickActionProps) {
  const theme = useTheme();
  const [burst, setBurst] = useState(0);

  return (
    <Wrapper>
      <PressableScale
        scaleTo={0.85}
        haptic="none"
        accessibilityLabel={`Marcar ${label}. ${count} até agora`}
        onPress={() => {
          if (!onPress(type)) {
            customToast('Aguardando o GPS para marcar o ponto.', 'warning');
            return;
          }
          thump();
          setBurst((b) => b + 1);
        }}
      >
        {burst > 0 ? (
          <Ripple
            key={`ripple-${burst}`}
            $type={type}
            from={{ scale: 1, opacity: 0.9 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={timing({ duration: 550 })}
            pointerEvents="none"
          />
        ) : null}
        <Circle $type={type}>
          <Icon size={RFValue(24)} color={theme.colors.ink} strokeWidth={2.4} />
        </Circle>
        {count > 0 ? (
          <Count key={`count-${count}`} from={{ scale: 0.4 }} animate={{ scale: 1 }} transition={spring({ damping: 8 })}>
            <CountText>{count}</CountText>
          </Count>
        ) : null}
      </PressableScale>
      <Label>{label}</Label>
    </Wrapper>
  );
}
