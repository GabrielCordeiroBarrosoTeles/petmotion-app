import styled from 'styled-components/native';

export const Container = styled.View`
  gap: ${({ theme }) => theme.spacing.medium}px;
`;

export const Body = styled.View`
  padding: 0 ${({ theme }) => theme.spacing.large}px;
  gap: ${({ theme }) => theme.spacing.small}px;
`;

export const Row = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.small}px;
`;

export const Flex = styled.View`
  flex: 1;
`;
