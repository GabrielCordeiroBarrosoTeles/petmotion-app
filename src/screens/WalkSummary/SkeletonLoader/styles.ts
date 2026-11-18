import styled from 'styled-components/native';

export const Container = styled.View<{ $top: number }>`
  padding: ${({ $top }) => $top + 32}px ${({ theme }) => theme.spacing.large}px 0;
  gap: ${({ theme }) => theme.spacing.medium}px;
`;
