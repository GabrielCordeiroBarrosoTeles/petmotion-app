import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';
import type { CounterVariant } from './types';

export const Value = styled.Text<{ $variant: CounterVariant; $onInk?: boolean }>`
  font-family: ${({ theme, $variant }) => ($variant === 'inline' ? theme.fonts.bodyHeavy : theme.fonts.display)};
  font-size: ${({ theme, $variant }) =>
    RFValue({ hero: theme.fontSizes.hero, stat: theme.fontSizes.xxl, inline: theme.fontSizes.medium }[$variant])}px;
  letter-spacing: ${({ $variant }) => ($variant === 'hero' ? -2 : -0.5)}px;
  color: ${({ theme, $onInk }) => ($onInk ? theme.colors.onInk : theme.colors.text)};
  font-variant: tabular-nums;
`;
