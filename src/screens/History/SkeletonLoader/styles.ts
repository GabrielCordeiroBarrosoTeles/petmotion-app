import styled from 'styled-components/native';

export const Container = styled.View`
  padding: 0 ${({ theme }) => theme.spacing.large}px;
  gap: ${({ theme }) => theme.spacing.small}px;
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.medium}px;
  padding: ${({ theme }) => theme.spacing.small}px;
  border-radius: ${({ theme }) => theme.radii.medium}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const Lines = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;
