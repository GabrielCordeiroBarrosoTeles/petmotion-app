import styled from 'styled-components/native';

export const Container = styled.View`
  padding: ${({ theme }) => theme.spacing.large}px;
  gap: ${({ theme }) => theme.spacing.medium}px;
`;

export const Row = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.small}px;
`;

export const Flex = styled.View`
  flex: 1;
`;

export const Center = styled.View`
  align-items: center;
  padding: ${({ theme }) => theme.spacing.large}px 0;
`;
