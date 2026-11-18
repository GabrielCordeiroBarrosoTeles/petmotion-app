import { RFValue } from 'react-native-responsive-fontsize';
import styled, { type DefaultTheme } from 'styled-components/native';
import type { ButtonStyleProps, ButtonVariant } from './types';

export const background = (theme: DefaultTheme, variant: ButtonVariant) =>
  ({
    primary: theme.colors.primary,
    ink: theme.colors.ink,
    ghost: 'transparent',
    danger: theme.colors.danger,
  })[variant];

export const foreground = (theme: DefaultTheme, variant: ButtonVariant) =>
  ({
    primary: theme.colors.ink,
    ink: theme.colors.onInk,
    ghost: theme.colors.ink,
    danger: theme.colors.white,
  })[variant];

const shadow = (theme: DefaultTheme, variant: ButtonVariant) =>
  ({
    primary: theme.colors.primaryDeep,
    ink: theme.colors.inkSoft,
    ghost: 'transparent',
    danger: '#C42B22',
  })[variant];

/** Base "3D": a sombra sólida embaixo dá a sensação de botão físico que afunda. */
export const Base = styled.View<ButtonStyleProps>`
  border-radius: ${({ theme }) => theme.radii.pill}px;
  background-color: ${({ theme, $variant }) => shadow(theme, $variant)};
  padding-bottom: ${({ $variant }) => ($variant === 'ghost' ? 0 : RFValue(4))}px;
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
`;

export const Face = styled.View<ButtonStyleProps>`
  min-height: ${({ $compact }) => RFValue($compact ? 44 : 56)}px;
  padding: 0 ${({ theme }) => theme.spacing.large}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  background-color: ${({ theme, $variant }) => background(theme, $variant)};
  border-width: ${({ $variant }) => ($variant === 'ghost' ? RFValue(2) : 0)}px;
  border-color: ${({ theme }) => theme.colors.line};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const Label = styled.Text<ButtonStyleProps>`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${({ theme, $compact }) => RFValue($compact ? theme.fontSizes.small : theme.fontSizes.medium)}px;
  color: ${({ theme, $variant }) => foreground(theme, $variant)};
`;

export const Spinner = styled.ActivityIndicator``;
