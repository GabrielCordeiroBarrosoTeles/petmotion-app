import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Card = styled(MotiView)<{ $member: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.medium}px;
  padding: ${({ theme }) => theme.spacing.large}px ${({ theme }) => theme.spacing.medium}px;
  border-radius: ${({ theme }) => theme.radii.large}px;
  background-color: ${({ theme, $member }) => ($member ? theme.colors.surface : theme.colors.primary)};
  border-width: ${({ $member }) => ($member ? RFValue(2) : 0)}px;
  border-color: ${({ theme }) => theme.colors.ink};
`;

export const Paw = styled.View`
  width: ${RFValue(52)}px;
  height: ${RFValue(52)}px;
  border-radius: ${RFValue(26)}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.ink};
`;

export const Texts = styled.View`
  flex: 1;
  gap: ${RFValue(3)}px;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.large + 2)}px;
  color: ${({ theme }) => theme.colors.ink};
`;

export const Body = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodySemi};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme }) => theme.colors.inkSoft};
`;
