import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Scroll = styled.ScrollView.attrs({ keyboardShouldPersistTaps: 'handled' })`
  flex: 1;
`;

export const Content = styled.View<{ $bottom: number }>`
  padding: 0 ${({ theme }) => theme.spacing.large}px ${({ $bottom }) => $bottom + 24}px;
  gap: ${({ theme }) => theme.spacing.large}px;
`;

export const Warning = styled.View`
  padding: ${({ theme }) => theme.spacing.large}px;
  border-radius: ${({ theme }) => theme.radii.medium}px;
  background-color: ${({ theme }) => theme.colors.blushSoft};
  gap: ${({ theme }) => theme.spacing.small}px;
`;

export const WarningTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.xl)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Item = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodySemi};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.medium)}px;
  line-height: ${({ theme }) => RFValue(theme.fontSizes.medium * 1.5)}px;
  color: ${({ theme }) => theme.colors.text};
`;
