import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';
import type { Weather } from '@/services/types';

export const Box = styled(MotiView)<{ $level: Weather['level'] }>`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small}px;
  padding: ${({ theme }) => theme.spacing.medium}px;
  border-radius: ${({ theme }) => theme.radii.medium}px;
  background-color: ${({ theme, $level }) =>
    ({ safe: theme.colors.skySoft, warning: theme.colors.sunSoft, danger: theme.colors.blushSoft })[$level]};
`;

export const Badge = styled.View<{ $level: Weather['level'] }>`
  width: ${RFValue(52)}px;
  height: ${RFValue(52)}px;
  border-radius: ${({ theme }) => theme.radii.small}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $level }) =>
    ({ safe: theme.colors.sky, warning: theme.colors.sun, danger: theme.colors.blush })[$level]};
`;

export const Temp = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.large)}px;
  color: ${({ theme }) => theme.colors.ink};
`;

export const Texts = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.spacing.xxs}px;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Body = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodySemi};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  line-height: ${({ theme }) => RFValue(theme.fontSizes.caption * 1.45)}px;
  color: ${({ theme }) => theme.colors.text};
`;
