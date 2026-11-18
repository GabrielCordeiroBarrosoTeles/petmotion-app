import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Screen = styled.View<{ $top: number }>`
  flex: 1;
  padding-top: ${({ $top }) => $top}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Scroll = styled.ScrollView.attrs({ showsVerticalScrollIndicator: false })`
  flex: 1;
`;

export const Section = styled.View`
  gap: ${({ theme }) => theme.spacing.medium}px;
  margin-bottom: ${({ theme }) => theme.spacing.large}px;
`;

export const SectionTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.xl)}px;
  color: ${({ theme }) => theme.colors.text};
  padding: 0 ${({ theme }) => theme.spacing.large}px;
`;

export const Hint = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodySemi};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 0 ${({ theme }) => theme.spacing.large}px;
  margin-top: ${({ theme }) => -theme.spacing.xs}px;
`;

export const DueRow = styled.ScrollView.attrs(({ theme }) => ({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: { gap: theme.spacing.small, paddingHorizontal: theme.spacing.large },
}))``;

export const Timeline = styled.View`
  padding: 0 ${({ theme }) => theme.spacing.large}px;
`;

export const Refresh = styled.RefreshControl.attrs(({ theme }) => ({
  tintColor: theme.colors.ink,
  colors: [theme.colors.ink],
  progressBackgroundColor: theme.colors.primary,
}))``;
