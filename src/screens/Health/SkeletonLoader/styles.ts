import styled from 'styled-components/native';

export const Container = styled.View`
  padding: 0 ${({ theme }) => theme.spacing.large}px;
  gap: ${({ theme }) => theme.spacing.small}px;
`;

export const Row = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.small}px;
`;

export const Lines = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.spacing.xs}px;
  padding-top: ${({ theme }) => theme.spacing.xs}px;
`;
