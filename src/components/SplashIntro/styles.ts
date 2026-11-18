import { MotiText, MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Overlay = styled(MotiView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.ink};
  overflow: hidden;
`;

export const Layer = styled(MotiView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const Pin = styled(MotiView)<{ $x: number; $y: number; $color: string }>`
  position: absolute;
  left: ${({ $x }) => $x - RFValue(9)}px;
  top: ${({ $y }) => $y - RFValue(9)}px;
  width: ${RFValue(18)}px;
  height: ${RFValue(18)}px;
  border-radius: ${RFValue(9)}px;
  border-width: ${RFValue(3)}px;
  border-color: ${({ theme }) => theme.colors.ink};
  background-color: ${({ $color }) => $color};
`;

export const BallSlot = styled(MotiView)<{ $x: number; $y: number; $size: number }>`
  position: absolute;
  left: ${({ $x, $size }) => $x - $size / 2}px;
  top: ${({ $y, $size }) => $y - $size / 2}px;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
`;

export const Brand = styled(MotiView)<{ $top: number }>`
  position: absolute;
  left: 0;
  right: 0;
  top: ${({ $top }) => $top}px;
  align-items: center;
`;

export const Word = styled.View`
  flex-direction: row;
`;

export const Letter = styled(MotiText)`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.display + 8)}px;
  letter-spacing: -1.5px;
  color: ${({ theme }) => theme.colors.onInk};
`;

export const Tagline = styled(MotiText)`
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  font-family: ${({ theme }) => theme.fonts.bodySemi};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.medium)}px;
  color: ${({ theme }) => theme.colors.onInkMuted};
`;
