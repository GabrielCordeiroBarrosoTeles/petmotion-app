import { Modal } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useReducedMotion } from 'react-native-reanimated';
import { useTheme } from 'styled-components/native';
import { useSafeInsets } from '@/hooks/useSafeInsets';
import { useConfirmStore } from '@/store/confirm';
import { spring, timing } from '@/theme/motion';
import { Button } from '../Button';
import { PressableScale } from '../PressableScale';
import {
  BADGE, Backdrop, BackdropPress, Badge, Cancel, CancelText, Message, Sheet, Title,
} from './styles';

/**
 * Folha de confirmação da marca (no lugar do Alert do sistema). Sobe do rodapé em mola,
 * com o selo do assunto encaixado na borda; na ação destrutiva o selo balança.
 * Tocar fora, "Cancelar" ou o voltar do Android cancelam.
 */
export function ConfirmHost() {
  const theme = useTheme();
  const insets = useSafeInsets();
  const reduced = useReducedMotion();
  const current = useConfirmStore((s) => s.current);
  const answer = useConfirmStore((s) => s.answer);

  if (!current) return null;
  const { title, message, confirmLabel, cancelLabel = 'Cancelar', icon: Icon, tone = 'danger' } = current;
  const cancel = () => answer(false);

  return (
    <Modal testID="confirm-modal" transparent visible statusBarTranslucent navigationBarTranslucent animationType="none" onRequestClose={cancel}>
      <Backdrop from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={timing({ duration: theme.motion.base })}>
        <BackdropPress onPress={cancel} accessibilityRole="button" accessibilityLabel="Fechar" />
      </Backdrop>
      <Sheet
        key={current.id}
        $bottom={insets.bottom}
        from={{ translateY: reduced ? 0 : RFValue(320) }}
        animate={{ translateY: 0 }}
        transition={spring(theme.motion.spring)}
      >
        <Badge
          testID="confirm-badge"
          $tone={tone}
          from={{ scale: reduced ? 1 : 0.4, rotate: reduced ? '0deg' : '-24deg' }}
          animate={{ scale: 1, rotate: '0deg' }}
          transition={spring({ ...theme.motion.springBouncy, delay: 120 })}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Icon size={BADGE * 0.4} color={theme.colors.ink} strokeWidth={2.4} />
        </Badge>
        <Title accessibilityRole="header">{title}</Title>
        <Message>{message}</Message>
        <Button title={confirmLabel} variant={tone === 'danger' ? 'danger' : 'primary'} onPress={() => answer(true)} />
        <PressableScale onPress={cancel} accessibilityLabel={cancelLabel}>
          <Cancel>
            <CancelText>{cancelLabel}</CancelText>
          </Cancel>
        </PressableScale>
      </Sheet>
    </Modal>
  );
}
