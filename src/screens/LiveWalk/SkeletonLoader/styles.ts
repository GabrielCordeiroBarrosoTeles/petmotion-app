import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  justify-content: flex-end;
`;

export const Sheet = styled.View<{ $bottom: number }>`
  padding: ${({ theme }) => theme.spacing.large}px;
  padding-bottom: ${({ $bottom }) => $bottom + 16}px;
  gap: ${({ theme }) => theme.spacing.small}px;
`;

export const Row = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const Flex = styled.View`
  flex: 1;
`;
