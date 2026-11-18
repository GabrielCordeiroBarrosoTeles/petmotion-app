import { MotiText } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Container = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const Label = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Box = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.small}px;
  border-radius: ${({ theme }) => theme.radii.medium}px;
  background-color: ${({ theme }) => theme.colors.ink};
`;

export const Step = styled.View<{ $disabled: boolean }>`
  width: ${RFValue(48)}px;
  height: ${RFValue(48)}px;
  border-radius: ${RFValue(24)}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
  opacity: ${({ $disabled }) => ($disabled ? 0.35 : 1)};
`;

export const Center = styled.View`
  align-items: center;
`;

export const Value = styled(MotiText)`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.display)}px;
  color: ${({ theme }) => theme.colors.onInk};
`;

export const Unit = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme }) => theme.colors.onInkMuted};
`;
