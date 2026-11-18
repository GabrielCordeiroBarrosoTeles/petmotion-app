import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Card = styled(MotiView)<{ $selected: boolean }>`
  padding: ${({ theme }) => theme.spacing.medium}px;
  border-radius: ${({ theme }) => theme.radii.medium}px;
  border-width: ${RFValue(2.5)}px;
  border-color: ${({ theme, $selected }) => ($selected ? theme.colors.primary : theme.colors.inkLine)};
  background-color: ${({ theme, $selected }) => ($selected ? theme.colors.inkSoft : 'transparent')};
  gap: ${RFValue(2)}px;
`;

export const Top = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.medium)}px;
  color: ${({ theme }) => theme.colors.onInk};
`;

export const Radio = styled.View<{ $selected: boolean }>`
  width: ${RFValue(22)}px;
  height: ${RFValue(22)}px;
  border-radius: ${RFValue(11)}px;
  border-width: ${RFValue(2.5)}px;
  border-color: ${({ theme, $selected }) => ($selected ? theme.colors.primary : theme.colors.inkLine)};
  align-items: center;
  justify-content: center;
`;

export const RadioDot = styled.View`
  width: ${RFValue(10)}px;
  height: ${RFValue(10)}px;
  border-radius: ${RFValue(5)}px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const PriceRow = styled.View`
  flex-direction: row;
  align-items: baseline;
  gap: ${RFValue(4)}px;
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

export const Price = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.xxl)}px;
  letter-spacing: -0.8px;
  color: ${({ theme }) => theme.colors.onInk};
`;

export const Period = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme }) => theme.colors.onInkMuted};
`;

export const Note = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodySemi};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme }) => theme.colors.onInkMuted};
`;

export const Tag = styled.Text`
  position: absolute;
  top: ${RFValue(-12)}px;
  right: ${({ theme }) => theme.spacing.medium}px;
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${RFValue(11)}px;
  color: ${({ theme }) => theme.colors.ink};
  background-color: ${({ theme }) => theme.colors.primary};
  padding: ${RFValue(4)}px ${RFValue(10)}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  overflow: hidden;
`;
