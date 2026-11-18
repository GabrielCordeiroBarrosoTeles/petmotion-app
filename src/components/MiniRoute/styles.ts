import styled from 'styled-components/native';

export const Frame = styled.View<{ $w: number; $h: number }>`
  width: ${({ $w }) => $w}px;
  height: ${({ $h }) => $h}px;
`;
