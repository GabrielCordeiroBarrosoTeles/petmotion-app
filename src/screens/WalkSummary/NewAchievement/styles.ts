import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Row = styled(MotiView)`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small}px;
  padding: ${({ theme }) => theme.spacing.medium}px;
  border-radius: ${({ theme }) => theme.radii.medium}px;
  background-color: ${({ theme }) => theme.colors.sunSoft};
  border-width: ${RFValue(2)}px;
  border-color: ${({ theme }) => theme.colors.sun};
`;

export const Medal = styled(MotiView)`
  width: ${RFValue(48)}px;
  height: ${RFValue(48)}px;
  border-radius: ${RFValue(24)}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.sun};
  border-width: ${RFValue(3)}px;
  border-color: ${({ theme }) => theme.colors.ink};
`;

export const Texts = styled.View`
  flex: 1;
`;

export const Kicker = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.large)}px;
  color: ${({ theme }) => theme.colors.text};
`;
