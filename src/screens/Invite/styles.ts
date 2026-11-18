import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Screen = styled.View<{ $top: number; $bottom: number }>`
  flex: 1;
  padding: ${({ $top }) => $top}px ${({ theme }) => theme.spacing.large}px ${({ $bottom }) => $bottom + 24}px;
  background-color: ${({ theme }) => theme.colors.background};
  justify-content: center;
`;

export const Card = styled.View`
  align-items: center;
  gap: ${({ theme }) => theme.spacing.medium}px;
`;

export const Title = styled.Text`
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.xxl)}px;
  letter-spacing: -0.8px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Message = styled.Text`
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.medium)}px;
  line-height: ${({ theme }) => RFValue(theme.fontSizes.medium * 1.5)}px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const Actions = styled.View`
  align-self: stretch;
  gap: ${({ theme }) => theme.spacing.small}px;
  margin-top: ${({ theme }) => theme.spacing.small}px;
`;
