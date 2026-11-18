import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Row = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const Chip = styled.View<{ $active: boolean }>`
  min-height: ${RFValue(36)}px;
  justify-content: center;
  padding: 0 ${({ theme }) => theme.spacing.small}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  border-width: ${RFValue(1.5)}px;
  border-color: ${({ theme, $active }) => ($active ? theme.colors.ink : theme.colors.line)};
  background-color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.surface)};
`;

export const ChipText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme }) => theme.colors.text};
`;
