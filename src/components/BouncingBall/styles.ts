import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Stage = styled.View<{ $size: number }>`
  width: ${({ $size }) => $size * 1.6}px;
  height: ${({ $size }) => $size * 2.4}px;
  align-items: center;
  justify-content: flex-end;
`;

export const Ball = styled(MotiView)<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ $size }) => $size / 2}px;
  background-color: ${({ theme }) => theme.colors.primary};
  overflow: hidden;
  transform-origin: bottom;
`;

export const Seam = styled.View<{ $size: number; $side: 'left' | 'right' }>`
  position: absolute;
  top: ${({ $size }) => -$size * 0.1}px;
  ${({ $side, $size }) => ($side === 'left' ? `left: ${-$size * 0.62}px;` : `right: ${-$size * 0.62}px;`)}
  width: ${({ $size }) => $size * 0.95}px;
  height: ${({ $size }) => $size * 1.2}px;
  border-radius: ${({ $size }) => $size}px;
  border-width: ${RFValue(3)}px;
  border-color: ${({ theme }) => theme.colors.white};
`;

export const Shadow = styled(MotiView)<{ $size: number }>`
  width: ${({ $size }) => $size * 0.9}px;
  height: ${({ $size }) => $size * 0.16}px;
  border-radius: ${({ $size }) => $size}px;
  margin-top: ${RFValue(6)}px;
  background-color: ${({ theme }) => theme.colors.inkLine};
`;
