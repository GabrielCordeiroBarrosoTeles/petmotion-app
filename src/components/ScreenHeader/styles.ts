import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small}px;
  padding: ${({ theme }) => theme.spacing.medium}px ${({ theme }) => theme.spacing.large}px;
`;

export const Texts = styled.View`
  flex: 1;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.xxl)}px;
  letter-spacing: -0.6px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Subtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodySemi};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const IconButton = styled.View<{ $filled?: boolean }>`
  width: ${RFValue(44)}px;
  height: ${RFValue(44)}px;
  border-radius: ${RFValue(22)}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $filled }) => ($filled ? theme.colors.ink : theme.colors.surface)};
`;
