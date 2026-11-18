import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Container = styled(MotiView)`
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl}px ${({ theme }) => theme.spacing.large}px;
  gap: ${({ theme }) => theme.spacing.small}px;
`;

export const Bubble = styled(MotiView)`
  width: ${RFValue(96)}px;
  height: ${RFValue(96)}px;
  border-radius: ${RFValue(48)}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.xl)}px;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

export const Message = styled.Text`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.medium)}px;
  line-height: ${({ theme }) => RFValue(theme.fontSizes.medium * 1.5)}px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.small}px;
`;
