import { FlatList } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';
import type { Walk } from '@/services/types';

export const Screen = styled.View<{ $top: number }>`
  flex: 1;
  padding-top: ${({ $top }) => $top}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const List = styled(FlatList<Walk>).attrs(({ theme }) => ({
  showsVerticalScrollIndicator: false,
}))``;

export const Separator = styled.View`
  height: ${({ theme }) => theme.spacing.small}px;
`;

export const Summary = styled.View`
  flex-direction: row;
  padding: ${({ theme }) => theme.spacing.medium}px;
  border-radius: ${({ theme }) => theme.radii.medium}px;
  background-color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.medium}px;
`;

export const SummaryItem = styled.View`
  flex: 1;
  gap: ${RFValue(2)}px;
`;

export const SummaryValue = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.xxl)}px;
  color: ${({ theme }) => theme.colors.ink};
`;

export const SummaryLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme }) => theme.colors.inkSoft};
`;

export const Footer = styled.ActivityIndicator.attrs(({ theme }) => ({ color: theme.colors.ink }))`
  padding: ${({ theme }) => theme.spacing.large}px;
`;

export const Refresh = styled.RefreshControl.attrs(({ theme }) => ({
  tintColor: theme.colors.ink,
  colors: [theme.colors.ink],
  progressBackgroundColor: theme.colors.primary,
}))``;
