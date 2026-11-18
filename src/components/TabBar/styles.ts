import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const BAR_HEIGHT = RFValue(66);
export const FAB_SIZE = RFValue(64);
/** Raio da elevação em volta da bola: a bola + um aro pinheiro de 7px. */
export const CRADLE_RADIUS = FAB_SIZE / 2 + RFValue(7);

/** Barra presa no rodapé, de ponta a ponta; o pinheiro desce até a borda da tela (atrás da barra do sistema). */
export const Wrapper = styled.View<{ $bottom: number }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: ${({ $bottom }) => BAR_HEIGHT + $bottom}px;
  padding-bottom: ${({ $bottom }) => $bottom}px;
  shadow-color: ${({ theme }) => theme.colors.ink};
  shadow-offset: 0px -6px;
  shadow-opacity: 0.18;
  shadow-radius: 16px;
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
  width: ${CRADLE_RADIUS * 2}px;
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
