import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.medium}px;
  padding: ${({ theme }) => theme.spacing.medium}px;
`;

export const IconBox = styled.View<{ $on: boolean }>`
  width: ${RFValue(42)}px;
  height: ${RFValue(42)}px;
  border-radius: ${({ theme }) => theme.radii.small}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $on }) => ($on ? theme.colors.primary : theme.colors.surfaceAlt)};
`;

export const Texts = styled.View`
  flex: 1;
  gap: ${RFValue(2)}px;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.medium)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Description = styled.Text`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  line-height: ${({ theme }) => RFValue(theme.fontSizes.caption * 1.45)}px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const Toggle = styled.Switch.attrs(({ theme }) => ({
  trackColor: { false: theme.colors.line, true: theme.colors.ink },
  thumbColor: theme.colors.surface,
  ios_backgroundColor: theme.colors.line,
}))``;
