import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled, { type DefaultTheme } from 'styled-components/native';
import type { WalkEventType } from '@/services/types';

const eventColor = (theme: DefaultTheme, type: WalkEventType) =>
  ({ pee: theme.colors.sun, poop: theme.colors.earth, water: theme.colors.sky })[type];

export const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const MapArea = styled.View`
  flex: 1;
`;

export const TopBar = styled.View<{ $top: number }>`
  position: absolute;
  top: ${({ $top }) => $top + 8}px;
  left: ${({ theme }) => theme.spacing.medium}px;
  right: ${({ theme }) => theme.spacing.medium}px;
  flex-direction: row;
  align-items: center;
`;

export const RoundButton = styled.View`
  width: ${RFValue(46)}px;
  height: ${RFValue(46)}px;
  border-radius: ${RFValue(23)}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const Center = styled.View<{ $top: number }>`
  flex: 1;
  justify-content: center;
  padding-top: ${({ $top }) => $top}px;
`;

export const Sheet = styled(MotiView)<{ $bottom: number }>`
  background-color: ${({ theme }) => theme.colors.ink};
  margin-top: ${({ theme }) => -theme.radii.large}px;
  border-top-left-radius: ${({ theme }) => theme.radii.large}px;
  border-top-right-radius: ${({ theme }) => theme.radii.large}px;
  padding: ${({ theme }) => theme.spacing.large}px;
  padding-bottom: ${({ $bottom }) => $bottom + 16}px;
  gap: ${({ theme }) => theme.spacing.medium}px;
`;

export const HeadRow = styled.View`
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.small}px;
`;

export const HeadMain = styled.View`
  flex-shrink: 1;
`;

export const Timer = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${RFValue(52)}px;
  line-height: ${RFValue(58)}px;
  letter-spacing: -2px;
  color: ${({ theme }) => theme.colors.onInk};
  font-variant: tabular-nums;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.xxl)}px;
  letter-spacing: -1px;
  color: ${({ theme }) => theme.colors.onInk};
`;

export const LiveRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

/** Ponto "ao vivo": pisca enquanto o passeio está rodando. */
export const LiveDot = styled(MotiView)`
  width: ${RFValue(8)}px;
  height: ${RFValue(8)}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const Caption = styled.Text`
  flex-shrink: 1;
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme }) => theme.colors.onInkMuted};
`;

export const Distance = styled.View`
  align-items: flex-end;
`;

export const DistanceValue = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.display + 4)}px;
  line-height: ${({ theme }) => RFValue(theme.fontSizes.display + 10)}px;
  letter-spacing: -1px;
  color: ${({ theme }) => theme.colors.primary};
  font-variant: tabular-nums;
`;

export const Pills = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const StatPill = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs}px;
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.small}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  background-color: ${({ theme }) => theme.colors.inkSoft};
`;

export const StatValue = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.large)}px;
  color: ${({ theme }) => theme.colors.onInk};
  font-variant: tabular-nums;
`;

export const StatLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme }) => theme.colors.onInkMuted};
`;

export const CountDot = styled.View<{ $type: WalkEventType }>`
  width: ${RFValue(22)}px;
  height: ${RFValue(22)}px;
  border-radius: ${RFValue(11)}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $type }) => eventColor(theme, $type)};
`;
