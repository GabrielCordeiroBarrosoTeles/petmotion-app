import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Row = styled(MotiView)`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.medium}px;
  padding: ${({ theme }) => theme.spacing.small}px;
  border-radius: ${({ theme }) => theme.radii.medium}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const Texts = styled.View`
  flex: 1;
`;

export const Name = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.large)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Meta = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodySemi};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const Edit = styled.View`
  width: ${RFValue(40)}px;
  height: ${RFValue(40)}px;
  border-radius: ${RFValue(20)}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surfaceAlt};
`;
