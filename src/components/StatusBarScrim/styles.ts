import styled from 'styled-components/native';
import type { StatusBarScrimProps } from './types';

export const Scrim = styled.View<{ $height: number; $tone: StatusBarScrimProps['tone'] }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: ${({ $height }) => $height}px;
  background-color: ${({ theme, $tone }) => theme.colors[$tone]};
`;
