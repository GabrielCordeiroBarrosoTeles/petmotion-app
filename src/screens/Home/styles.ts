import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Scroll = styled.ScrollView.attrs({ showsVerticalScrollIndicator: false })`
  flex: 1;
`;

export const Header = styled.View<{ $top: number }>`
  background-color: ${({ theme }) => theme.colors.ink};
  padding-top: ${({ $top }) => $top + 12}px;
  padding-bottom: ${({ theme }) => theme.spacing.xl}px;
  border-bottom-left-radius: ${({ theme }) => theme.radii.large + 8}px;
  border-bottom-right-radius: ${({ theme }) => theme.radii.large + 8}px;
  gap: ${({ theme }) => theme.spacing.large}px;
`;

export const TopRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing.large}px;
`;

export const Greeting = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodySemi};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.medium)}px;
  color: ${({ theme }) => theme.colors.onInkMuted};
`;

export const GreetingName = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.xxl)}px;
  color: ${({ theme }) => theme.colors.onInk};
  letter-spacing: -0.6px;
`;

export const StreakChip = styled(MotiView)`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs}px;
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.small}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  background-color: ${({ theme }) => theme.colors.inkSoft};
`;

export const StreakText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme }) => theme.colors.sun};
`;

export const RingRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.large}px;
  padding: 0 ${({ theme }) => theme.spacing.large}px;
`;

export const RingCenter = styled.View`
  align-items: center;
`;

export const RingCaption = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme }) => theme.colors.onInkMuted};
  margin-top: ${RFValue(-4)}px;
`;

export const RingSide = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.spacing.small}px;
`;

export const GoalTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.xl)}px;
  line-height: ${({ theme }) => RFValue(theme.fontSizes.xl * 1.15)}px;
  color: ${({ theme }) => theme.colors.onInk};
`;

export const GoalBody = styled.Text`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  line-height: ${({ theme }) => RFValue(theme.fontSizes.small * 1.45)}px;
  color: ${({ theme }) => theme.colors.onInkMuted};
`;

export const Body = styled.View<{ $bottom: number }>`
  padding: ${({ theme }) => theme.spacing.large}px;
  padding-bottom: ${({ $bottom }) => $bottom}px;
  gap: ${({ theme }) => theme.spacing.large}px;
`;

export const TileRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.small}px;
`;

export const Card = styled(MotiView)`
  padding: ${({ theme }) => theme.spacing.large}px ${({ theme }) => theme.spacing.medium}px;
  border-radius: ${({ theme }) => theme.radii.medium}px;
  background-color: ${({ theme }) => theme.colors.surface};
  gap: ${({ theme }) => theme.spacing.medium}px;
`;

export const SectionHeader = styled.View`
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
`;

export const SectionTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.xl)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const SectionMeta = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const Badges = styled.ScrollView.attrs(({ theme }) => ({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: { gap: theme.spacing.small, paddingHorizontal: theme.spacing.large },
}))`
  margin: 0 ${({ theme }) => -theme.spacing.large}px;
`;

export const UpcomingRow = styled(MotiView)`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small}px;
`;

export const UpcomingIcon = styled.View<{ $late: boolean }>`
  width: ${RFValue(42)}px;
  height: ${RFValue(42)}px;
  border-radius: ${({ theme }) => theme.radii.small}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $late }) => ($late ? theme.colors.blush : theme.colors.blushSoft)};
`;

export const UpcomingTexts = styled.View`
  flex: 1;
`;

export const UpcomingTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.medium)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const UpcomingWhen = styled.Text<{ $late: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme, $late }) => ($late ? theme.colors.danger : theme.colors.textMuted)};
`;

export const Refresh = styled.RefreshControl.attrs(({ theme }) => ({
  tintColor: theme.colors.primary,
  colors: [theme.colors.ink],
  progressBackgroundColor: theme.colors.primary,
}))``;
