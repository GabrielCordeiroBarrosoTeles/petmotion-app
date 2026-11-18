import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Ball = styled(MotiView)<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ $size }) => $size / 2}px;
  background-color: ${({ theme }) => theme.colors.primary};
  overflow: hidden;
`;

export const Seam = styled.View<{ $size: number; $side: 'left' | 'right' }>`
  position: absolute;
  top: ${({ $size }) => -$size * 0.1}px;
  ${({ $side, $size }) => ($side === 'left' ? `left: ${-$size * 0.62}px;` : `right: ${-$size * 0.62}px;`)}
  width: ${({ $size }) => $size * 0.95}px;
  height: ${({ $size }) => $size * 1.2}px;
  border-radius: ${({ $size }) => $size}px;
  border-width: ${RFValue(2.5)}px;
  border-color: ${({ theme }) => theme.colors.white};
  opacity: 0.9;
`;

export const Center = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  align-items: center;
  justify-content: center;
`;
