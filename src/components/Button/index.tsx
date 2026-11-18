import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components/native';
import { PressableScale } from '../PressableScale';
import { Base, Face, foreground, Label, Spinner } from './styles';
import type { ButtonProps } from './types';

export function Button({ title, onPress, variant = 'primary', icon: Icon, loading, disabled, compact, accessibilityHint }: ButtonProps) {
  const theme = useTheme();
  const color = foreground(theme, variant);
  const inactive = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      scaleTo={0.97}
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
    >
      <Base $variant={variant} $disabled={disabled}>
        <Face $variant={variant} $compact={compact}>
          {loading ? (
            <Spinner color={color} />
          ) : (
            <>
              {Icon ? <Icon size={RFValue(compact ? 16 : 20)} color={color} strokeWidth={2.4} /> : null}
              <Label $variant={variant} $compact={compact}>{title}</Label>
            </>
          )}
        </Face>
      </Base>
    </PressableScale>
  );
}
