import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components/native';
import { Button } from '../Button';
import { Bubble, Container, Message, Title } from './styles';
import type { EmptyStateProps } from './types';
import { spring, timing } from '@/theme/motion';

export function EmptyState({ icon: Icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();
  return (
    <Container from={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={spring({ damping: 14 })}>
      <Bubble
        from={{ translateY: 0 }}
        animate={{ translateY: -6 }}
        transition={timing({ duration: 1400, loop: true, repeatReverse: true })}
      >
        <Icon size={RFValue(42)} color={theme.colors.ink} strokeWidth={2.2} />
      </Bubble>
      <Title>{title}</Title>
      <Message>{message}</Message>
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} variant="ink" /> : null}
    </Container>
  );
}
