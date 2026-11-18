import styled from 'styled-components/native';

/** Sobe o desenho para a elevação ficar acima da borda da barra. */
export const Layer = styled.View<{ $lift: number }>`
  position: absolute;
  top: ${({ $lift }) => -$lift}px;
  left: 0;
`;
