import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export type DueTone = 'late' | 'soon' | 'later';

export const Card = styled(MotiView)<{ $tone: DueTone }>`
  width: ${RFValue(158)}px;
  padding: ${({ theme }) => theme.spacing.medium}px;
  border-radius: ${({ theme }) => theme.radii.medium}px;
  gap: ${({ theme }) => theme.spacing.xs}px;
  background-color: ${({ theme, $tone }) =>
    ({ late: theme.colors.blush, soon: theme.colors.sun, later: theme.colors.surface })[$tone]};
`;

export const Days = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.display)}px;
  letter-spacing: -1px;
  color: ${({ theme }) => theme.colors.ink};
`;

export const DaysLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme }) => theme.colors.ink};
  margin-top: ${RFValue(-6)}px;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme }) => theme.colors.ink};
`;

export const TypeRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${RFValue(4)}px;
`;

export const TypeText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodySemi};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme }) => theme.colors.inkSoft};
`;
