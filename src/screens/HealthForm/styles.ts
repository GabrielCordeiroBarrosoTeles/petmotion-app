import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Scroll = styled.ScrollView.attrs({ keyboardShouldPersistTaps: 'handled', showsVerticalScrollIndicator: false })`
  flex: 1;
`;

export const Form = styled.View<{ $bottom: number }>`
  padding: 0 ${({ theme }) => theme.spacing.large}px ${({ $bottom }) => $bottom + 24}px;
  gap: ${({ theme }) => theme.spacing.large}px;
`;

export const Group = styled.View`
  gap: ${({ theme }) => theme.spacing.small}px;
`;

export const GroupLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const Row = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.small}px;
`;

export const Half = styled.View`
  flex: 1;
`;
