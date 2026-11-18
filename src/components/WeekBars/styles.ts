import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const CHART_HEIGHT = RFValue(120);

export const Row = styled.View`
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  height: ${CHART_HEIGHT + RFValue(28)}px;
`;

export const Column = styled.View`
  flex: 1;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const Track = styled.View`
  width: ${RFValue(26)}px;
  height: ${CHART_HEIGHT}px;
  justify-content: flex-end;
`;

export const Bar = styled(MotiView)<{ $height: number; $hit: boolean; $today: boolean }>`
  height: ${({ $height }) => $height}px;
  border-radius: ${RFValue(8)}px;
  transform-origin: bottom;
  background-color: ${({ theme, $hit, $today }) =>
    $hit ? theme.colors.primary : $today ? theme.colors.sky : theme.colors.surfaceAlt};
`;

export const GoalLine = styled.View<{ $bottom: number }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: ${({ $bottom }) => $bottom + RFValue(28)}px;
  border-top-width: ${RFValue(1.5)}px;
  border-style: dashed;
  border-color: ${({ theme }) => theme.colors.textMuted};
  opacity: 0.5;
`;

export const Day = styled.Text<{ $today: boolean }>`
  font-family: ${({ theme, $today }) => ($today ? theme.fonts.bodyHeavy : theme.fonts.bodySemi)};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme, $today }) => ($today ? theme.colors.text : theme.colors.textMuted)};
  text-transform: capitalize;
`;
