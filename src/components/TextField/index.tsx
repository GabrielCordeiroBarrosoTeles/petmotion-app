import { Eye, EyeOff } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useState } from 'react';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components/native';
import { useKeyboardScrollToFocused } from '@/hooks/KeyboardScrollContext';
import { Container, FieldBox, Helper, Input, Label, Toggle } from './styles';
import type { TextFieldProps } from './types';
import { timing } from '@/theme/motion';

export function TextField({ label, icon: Icon, error, helper, secure, onFocus, onBlur, ...input }: TextFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secure);
  const scrollToFocused = useKeyboardScrollToFocused();
  const iconColor = error ? theme.colors.danger : focused ? theme.colors.ink : theme.colors.textMuted;

  return (
    <Container>
      <Label>{label}</Label>
      <MotiView animate={{ translateX: error ? [0, -6, 6, -4, 4, 0] : 0 }} transition={timing({ duration: 60 })}>
        <FieldBox $focused={focused} $error={!!error}>
          {Icon ? <Icon size={RFValue(20)} color={iconColor} /> : null}
          <Input
            {...input}
            accessibilityLabel={label}
            secureTextEntry={hidden}
            onFocus={(e) => {
              setFocused(true);
              scrollToFocused?.();
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
          />
          {secure ? (
            <Toggle
              onPress={() => setHidden((h) => !h)}
              accessibilityRole="button"
              accessibilityLabel={hidden ? 'Mostrar senha' : 'Esconder senha'}
              hitSlop={10}
            >
              {hidden ? <Eye size={RFValue(20)} color={theme.colors.textMuted} /> : <EyeOff size={RFValue(20)} color={theme.colors.textMuted} />}
            </Toggle>
          ) : null}
        </FieldBox>
      </MotiView>
      {error ? <Helper $error accessibilityLiveRegion="polite">{error}</Helper> : helper ? <Helper>{helper}</Helper> : null}
    </Container>
  );
}
