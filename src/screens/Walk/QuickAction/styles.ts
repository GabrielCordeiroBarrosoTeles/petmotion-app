import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled, { type DefaultTheme } from 'styled-components/native';
import type { WalkEventType } from '@/services/types';

export const eventColor = (theme: DefaultTheme, type: WalkEventType) =>
  ({ pee: theme.colors.sun, poop: theme.colors.earth, water: theme.colors.sky })[type];

export const Wrapper = styled.View`
  flex: 1;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const Circle = styled.View<{ $type: WalkEventType }>`
  width: ${RFValue(52)}px;
  height: ${RFValue(52)}px;
  border-radius: ${RFValue(26)}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $type }) => eventColor(theme, $type)};
`;

export const Ripple = styled(MotiView)<{ $type: WalkEventType }>`
  position: absolute;
  width: ${RFValue(52)}px;
  height: ${RFValue(52)}px;
  border-radius: ${RFValue(26)}px;
  border-width: ${RFValue(3)}px;
  border-color: ${({ theme, $type }) => eventColor(theme, $type)};
`;

export const Count = styled(MotiView)`
  position: absolute;
  top: ${RFValue(-4)}px;
  right: ${RFValue(-4)}px;
  min-width: ${RFValue(24)}px;
  height: ${RFValue(24)}px;
  padding: 0 ${RFValue(6)}px;
  border-radius: ${RFValue(12)}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.onInk};
`;

export const CountText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.ink};
`;

export const Label = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme }) => theme.colors.onInkMuted};
`;
