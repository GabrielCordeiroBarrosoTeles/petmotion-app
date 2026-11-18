import styled from 'styled-components/native';

export const Wrapper = styled.View<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  align-items: center;
  justify-content: center;
`;

export const Center = styled.View`
  position: absolute;
  align-items: center;
  justify-content: center;
`;

export const RotatedSvg = styled.View`
  position: absolute;
  transform: rotate(-90deg);
`;
