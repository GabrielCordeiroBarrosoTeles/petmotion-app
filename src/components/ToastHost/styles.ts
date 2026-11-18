import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';
import type { ToastBoxProps } from './types';

export const Wrapper = styled(MotiView)<ToastBoxProps>`
  position: absolute;
  top: ${({ $top }) => $top}px;
  left: ${({ theme }) => theme.spacing.medium}px;
  right: ${({ theme }) => theme.spacing.medium}px;
  z-index: 999;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small}px;
  padding: ${({ theme }) => theme.spacing.medium}px;
  border-radius: ${({ theme }) => theme.radii.medium}px;
  background-color: ${({ theme }) => theme.colors.ink};
  border-left-width: ${RFValue(6)}px;
  border-left-color: ${({ theme, $type }) =>
    ({ success: theme.colors.primary, warning: theme.colors.sun, danger: theme.colors.blush })[$type]};
`;

export const Message = styled.Text`
  flex: 1;
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme }) => theme.colors.onInk};
`;
