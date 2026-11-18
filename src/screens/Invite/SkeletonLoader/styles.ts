import styled from 'styled-components/native';

export const Container = styled.View`
  align-items: center;
  gap: ${({ theme }) => theme.spacing.medium}px;
`;

export const Lines = styled.View`
  align-self: stretch;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;
