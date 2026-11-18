import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled, { type DefaultTheme } from 'styled-components/native';
import type { HealthType } from '@/services/types';

export const typeColor = (theme: DefaultTheme, type: HealthType) =>
  ({ vaccine: theme.colors.blush, vermifuge: theme.colors.primary, medicine: theme.colors.sky, vet: theme.colors.sun })[type];

export const Row = styled(MotiView)`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.medium}px;
`;

export const Rail = styled.View`
  align-items: center;
  width: ${RFValue(40)}px;
`;

export const Dot = styled.View<{ $type: HealthType }>`
  width: ${RFValue(40)}px;
  height: ${RFValue(40)}px;
  border-radius: ${RFValue(20)}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $type }) => typeColor(theme, $type)};
`;

export const Line = styled.View`
  flex: 1;
  width: ${RFValue(2)}px;
  min-height: ${({ theme }) => theme.spacing.large}px;
  background-color: ${({ theme }) => theme.colors.line};
`;

export const Content = styled.View`
  flex: 1;
  padding-bottom: ${({ theme }) => theme.spacing.large}px;
  gap: ${RFValue(2)}px;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.medium)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Meta = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodySemi};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const Notes = styled.Text`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  line-height: ${({ theme }) => RFValue(theme.fontSizes.small * 1.45)}px;
  color: ${({ theme }) => theme.colors.text};
  margin-top: ${({ theme }) => theme.spacing.xxs}px;
`;
