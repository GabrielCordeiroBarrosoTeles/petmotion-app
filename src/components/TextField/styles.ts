import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';
import type { FieldBoxProps } from './types';

export const Container = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const Label = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const FieldBox = styled.View<FieldBoxProps>`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small}px;
  min-height: ${RFValue(54)}px;
  padding: 0 ${({ theme }) => theme.spacing.medium}px;
  border-radius: ${({ theme }) => theme.radii.medium}px;
  border-width: ${RFValue(2)}px;
  border-color: ${({ theme, $focused, $error }) =>
    $error ? theme.colors.danger : $focused ? theme.colors.ink : theme.colors.line};
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const Input = styled.TextInput.attrs(({ theme }) => ({
  underlineColorAndroid: 'transparent',
  placeholderTextColor: theme.colors.textMuted,
  selectionColor: theme.colors.ink,
}))`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.small}px 0;
  font-family: ${({ theme }) => theme.fonts.bodySemi};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.medium)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Toggle = styled.Pressable`
  padding: ${({ theme }) => theme.spacing.xs}px;
`;

export const Helper = styled.Text<{ $error?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bodySemi};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme, $error }) => ($error ? theme.colors.danger : theme.colors.textMuted)};
`;
