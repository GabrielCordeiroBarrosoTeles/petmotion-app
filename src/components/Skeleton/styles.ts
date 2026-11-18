import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';
import type { SkeletonBlockProps } from './types';

export const Block = styled(MotiView)<SkeletonBlockProps>`
  width: ${({ $width }) => (typeof $width === 'number' ? `${RFValue($width)}px` : $width)};
  height: ${({ $height }) => RFValue($height)}px;
  border-radius: ${({ $radius }) => RFValue($radius)}px;
  background-color: ${({ theme }) => theme.colors.skeleton};
`;
