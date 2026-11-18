import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const BAR_HEIGHT = RFValue(66);
export const FAB_SIZE = RFValue(64);
/** Raio do encaixe: a bola + um respiro de 7px em volta. */
export const NOTCH_RADIUS = FAB_SIZE / 2 + RFValue(7);

export const Wrapper = styled.View<{ $bottom: number }>`
  position: absolute;
  left: ${({ theme }) => theme.spacing.medium}px;
  right: ${({ theme }) => theme.spacing.medium}px;
  bottom: ${({ $bottom }) => $bottom}px;
  height: ${BAR_HEIGHT}px;
  shadow-color: ${({ theme }) => theme.colors.ink};
  shadow-offset: 0px 12px;
  shadow-opacity: 0.28;
  shadow-radius: 20px;
  elevation: 14;
`;

export const Row = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
`;

export const Side = styled.View`
  flex: 1;
  flex-direction: row;
`;

export const Gap = styled.View`
  width: ${NOTCH_RADIUS * 2}px;
`;

export const Slot = styled.Pressable`
  flex: 1;
  height: ${BAR_HEIGHT}px;
  align-items: center;
  justify-content: center;
`;

export const IconLift = styled(MotiView)`
  align-items: center;
  gap: ${RFValue(3)}px;
`;

export const TabLabel = styled(MotiView)``;

export const TabLabelText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${RFValue(11)}px;
  color: ${({ theme }) => theme.colors.primary};
`;

export const Dot = styled(MotiView)`
  width: ${RFValue(5)}px;
  height: ${RFValue(5)}px;
  border-radius: ${RFValue(3)}px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const FabWrap = styled.View`
  position: absolute;
  top: ${-FAB_SIZE / 2}px;
  left: 50%;
  margin-left: ${-FAB_SIZE / 2}px;
  width: ${FAB_SIZE}px;
  height: ${FAB_SIZE}px;
  align-items: center;
`;

export const Timer = styled(MotiView)`
  position: absolute;
  top: ${-RFValue(30)}px;
  padding: ${RFValue(4)}px ${({ theme }) => theme.spacing.small}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  background-color: ${({ theme }) => theme.colors.ink};
  border-width: ${RFValue(2)}px;
  border-color: ${({ theme }) => theme.colors.primary};
`;

export const TimerText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.primary};
  font-variant: tabular-nums;
`;
