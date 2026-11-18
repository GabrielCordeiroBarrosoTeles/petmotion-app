import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Row = styled(MotiView)`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.medium}px;
`;

export const IconTile = styled.View<{ $soon: boolean }>`
  width: ${RFValue(46)}px;
  height: ${RFValue(46)}px;
  border-radius: ${({ theme }) => theme.radii.small + 4}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $soon }) => ($soon ? theme.colors.inkSoft : theme.colors.primary)};
`;

export const Texts = styled.View`
  flex: 1;
  gap: ${RFValue(2)}px;
`;

export const TitleRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.medium)}px;
  color: ${({ theme }) => theme.colors.onInk};
`;

export const Soon = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${RFValue(10)}px;
  color: ${({ theme }) => theme.colors.ink};
  background-color: ${({ theme }) => theme.colors.sun};
  padding: ${RFValue(2)}px ${RFValue(7)}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  overflow: hidden;
`;

export const Description = styled.Text`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  line-height: ${({ theme }) => RFValue(theme.fontSizes.small * 1.4)}px;
  color: ${({ theme }) => theme.colors.onInkMuted};
`;
