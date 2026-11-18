import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Card = styled.View<{ $unlocked: boolean }>`
  width: ${RFValue(112)}px;
  padding: ${({ theme }) => theme.spacing.medium}px ${({ theme }) => theme.spacing.small}px;
  border-radius: ${({ theme }) => theme.radii.medium}px;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
  background-color: ${({ theme, $unlocked }) => ($unlocked ? theme.colors.surface : theme.colors.surfaceAlt)};
`;

export const Medal = styled.View<{ $unlocked: boolean }>`
  width: ${RFValue(58)}px;
  height: ${RFValue(58)}px;
  border-radius: ${RFValue(29)}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $unlocked }) => ($unlocked ? theme.colors.sun : theme.colors.skeleton)};
  border-width: ${RFValue(3)}px;
  border-color: ${({ theme, $unlocked }) => ($unlocked ? theme.colors.ink : 'transparent')};
`;

export const Title = styled.Text<{ $unlocked: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme, $unlocked }) => ($unlocked ? theme.colors.text : theme.colors.textMuted)};
  text-align: center;
`;

export const Track = styled.View`
  width: 100%;
  height: ${RFValue(6)}px;
  border-radius: ${RFValue(3)}px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.skeleton};
`;

export const Fill = styled.View<{ $progress: number }>`
  width: ${({ $progress }) => Math.round($progress * 100)}%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.ink};
`;
