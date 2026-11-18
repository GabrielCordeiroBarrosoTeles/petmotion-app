import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Pill = styled.View<{ $onInk: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: ${RFValue(4)}px;
  padding: ${RFValue(3)}px ${({ theme }) => theme.spacing.xs}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  background-color: ${({ theme, $onInk }) => ($onInk ? theme.colors.primary : theme.colors.ink)};
  align-self: flex-start;
`;

export const Label = styled.Text<{ $onInk: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${RFValue(11)}px;
  color: ${({ theme, $onInk }) => ($onInk ? theme.colors.ink : theme.colors.primary)};
`;
