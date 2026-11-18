import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.ink};
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
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const RoundButton = styled.View`
  width: ${RFValue(46)}px;
  height: ${RFValue(46)}px;
  border-radius: ${RFValue(23)}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const Chip = styled(MotiView)<{ $tone?: 'ink' | 'sun' | 'surface' }>`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs}px;
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.small}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  background-color: ${({ theme, $tone = 'surface' }) =>
    ({ ink: theme.colors.ink, sun: theme.colors.sun, surface: theme.colors.surface })[$tone]};
`;

export const ChipText = styled.Text<{ $onInk?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme, $onInk }) => ($onInk ? theme.colors.onInk : theme.colors.ink)};
`;

export const Spacer = styled.View`
  flex: 1;
`;

export const Sheet = styled(MotiView)<{ $bottom: number }>`
  background-color: ${({ theme }) => theme.colors.ink};
  margin-top: ${({ theme }) => -theme.radii.large}px;
  border-top-left-radius: ${({ theme }) => theme.radii.large}px;
  border-top-right-radius: ${({ theme }) => theme.radii.large}px;
  padding: ${({ theme }) => theme.spacing.large}px;
  padding-bottom: ${({ $bottom }) => $bottom + 16}px;
  gap: ${({ theme }) => theme.spacing.large}px;
`;

export const Grabber = styled.View`
  align-self: center;
  width: ${RFValue(40)}px;
  height: ${RFValue(5)}px;
  border-radius: ${RFValue(3)}px;
  margin-top: ${({ theme }) => -theme.spacing.xs}px;
  background-color: ${({ theme }) => theme.colors.inkLine};
`;

export const Timer = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${RFValue(68)}px;
  letter-spacing: -2px;
  color: ${({ theme }) => theme.colors.onInk};
  text-align: center;
  font-variant: tabular-nums;
`;

export const TimerCaption = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme }) => theme.colors.onInkMuted};
  text-align: center;
  margin-top: ${({ theme }) => -theme.spacing.medium}px;
`;

export const Stats = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.medium}px 0;
  border-top-width: 1px;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.colors.inkSoft};
`;

export const Stat = styled.View`
  flex: 1;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs}px;
`;

export const StatValue = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.xxl)}px;
  color: ${({ theme }) => theme.colors.primary};
  font-variant: tabular-nums;
`;

export const StatLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme }) => theme.colors.onInkMuted};
`;

export const Actions = styled.View`
  flex-direction: row;
`;

export const Controls = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.small}px;
`;

export const ControlFlex = styled.View`
  flex: 1;
`;

export const PauseButton = styled.View`
  width: ${RFValue(56)}px;
  height: ${RFValue(56)}px;
  border-radius: ${RFValue(28)}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const ReadyTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.display)}px;
  line-height: ${({ theme }) => RFValue(theme.fontSizes.display * 1.08)}px;
  letter-spacing: -1px;
  color: ${({ theme }) => theme.colors.onInk};
`;

export const ReadyBody = styled.Text`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.medium)}px;
  line-height: ${({ theme }) => RFValue(theme.fontSizes.medium * 1.5)}px;
  color: ${({ theme }) => theme.colors.onInkMuted};
  margin-top: ${({ theme }) => -theme.spacing.small}px;
`;

export const StartRow = styled.View`
  align-items: center;
`;

export const StartBall = styled(MotiView)`
  width: ${RFValue(112)}px;
  height: ${RFValue(112)}px;
  border-radius: ${RFValue(56)}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
  border-width: ${RFValue(6)}px;
  border-color: ${({ theme }) => theme.colors.inkSoft};
`;

export const StartLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.large)}px;
  color: ${({ theme }) => theme.colors.ink};
`;

export const SavingOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.medium}px;
  background-color: ${({ theme }) => theme.colors.overlay};
`;

export const SavingText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.medium)}px;
  color: ${({ theme }) => theme.colors.onInk};
`;

export const Spinner = styled.ActivityIndicator.attrs(({ theme }) => ({ color: theme.colors.primary, size: 'large' }))``;
