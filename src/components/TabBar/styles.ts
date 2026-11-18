import { RFValue } from 'react-native-responsive-fontsize';
import Animated from 'react-native-reanimated';
import styled from 'styled-components/native';

export const BAR_HEIGHT = RFValue(68);
export const FAB_SIZE = RFValue(72);

export const Wrapper = styled.View<{ $bottom: number }>`
  position: absolute;
  left: ${({ theme }) => theme.spacing.medium}px;
  right: ${({ theme }) => theme.spacing.medium}px;
  bottom: ${({ $bottom }) => $bottom}px;
`;

export const Bar = styled.View`
  height: ${BAR_HEIGHT}px;
  flex-direction: row;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.large}px;
  background-color: ${({ theme }) => theme.colors.ink};
  padding: 0 ${RFValue(6)}px;
  shadow-color: ${({ theme }) => theme.colors.ink};
  shadow-offset: 0px 10px;
  shadow-opacity: 0.25;
  shadow-radius: 18px;
  elevation: 12;
`;

export const Slot = styled.Pressable`
  flex: 1;
  height: 100%;
  align-items: center;
  justify-content: center;
  gap: ${RFValue(3)}px;
`;

export const Indicator = styled(Animated.View)`
  position: absolute;
  top: ${RFValue(8)}px;
  left: ${RFValue(6)}px;
  height: ${BAR_HEIGHT - RFValue(16)}px;
  border-radius: ${({ theme }) => theme.radii.medium}px;
  background-color: ${({ theme }) => theme.colors.inkSoft};
`;

export const TabLabel = styled.Text<{ $active: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${RFValue(11)}px;
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.onInkMuted)};
`;

export const FabSlot = styled.View`
  flex: 1;
  align-items: center;
`;

export const Fab = styled.View`
  width: ${FAB_SIZE}px;
  height: ${FAB_SIZE}px;
  border-radius: ${FAB_SIZE / 2}px;
  margin-top: ${-FAB_SIZE * 0.42}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
  border-width: ${RFValue(5)}px;
  border-color: ${({ theme }) => theme.colors.background};
`;

export const FabPulse = styled(Animated.View)`
  position: absolute;
  top: ${-FAB_SIZE * 0.42}px;
  width: ${FAB_SIZE}px;
  height: ${FAB_SIZE}px;
  border-radius: ${FAB_SIZE / 2}px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const FabTime = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${RFValue(11)}px;
  color: ${({ theme }) => theme.colors.ink};
  font-variant: tabular-nums;
`;
