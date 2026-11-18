import { CircleAlert, CircleCheck, TriangleAlert } from 'lucide-react-native';
import { AnimatePresence } from 'moti';
import { useEffect } from 'react';
import { Pressable } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';
import { useToastStore } from '@/store/toast';
import { Message, Wrapper } from './styles';
import { spring } from '@/theme/motion';

export function ToastHost() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const current = useToastStore((s) => s.current);
  const hide = useToastStore((s) => s.hide);

  useEffect(() => {
    if (!current) return;
    const id = setTimeout(hide, 3200);
    return () => clearTimeout(id);
  }, [current, hide]);

  const Icon = current?.type === 'success' ? CircleCheck : current?.type === 'warning' ? TriangleAlert : CircleAlert;
  const color = {
    success: theme.colors.primary,
    warning: theme.colors.sun,
    danger: theme.colors.blush,
  }[current?.type ?? 'success'];

  return (
    <AnimatePresence>
      {current ? (
        <Wrapper
          key={current.id}
          $type={current.type}
          $top={insets.top + theme.spacing.xs}
          from={{ opacity: 0, translateY: -40, scale: 0.92 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          exit={{ opacity: 0, translateY: -30 }}
          transition={spring({ damping: 15 })}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
        >
          <Icon size={RFValue(22)} color={color} />
          <Message>{current.message}</Message>
          <Pressable onPress={hide} accessibilityLabel="Fechar aviso" hitSlop={12} />
        </Wrapper>
      ) : null}
    </AnimatePresence>
  );
}
