import styled from 'styled-components/native';

export const Container = styled.View`
  padding: 0 ${({ theme }) => theme.spacing.large}px;
  gap: ${({ theme }) => theme.spacing.medium}px;
`;
