import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const ROUTE_SIZE = RFValue(76);

export const Card = styled(MotiView)`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.medium}px;
  padding: ${({ theme }) => theme.spacing.small}px;
  border-radius: ${({ theme }) => theme.radii.medium}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const RouteTile = styled.View`
  width: ${ROUTE_SIZE}px;
  height: ${ROUTE_SIZE}px;
  border-radius: ${({ theme }) => theme.radii.small + 4}px;
  background-color: ${({ theme }) => theme.colors.ink};
  align-items: center;
  justify-content: center;
`;

export const Info = styled.View`
  flex: 1;
  gap: ${RFValue(2)}px;
`;

export const When = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const Distance = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.xl + 2)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Meta = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodySemi};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const Marks = styled.View`
  flex-direction: row;
  gap: ${RFValue(4)}px;
  margin-top: ${RFValue(4)}px;
`;

export const Mark = styled.View<{ $color: string }>`
  flex-direction: row;
  align-items: center;
  gap: ${RFValue(2)}px;
  padding: ${RFValue(2)}px ${RFValue(7)}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  background-color: ${({ $color }) => $color};
`;

export const MarkText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${RFValue(11)}px;
  color: ${({ theme }) => theme.colors.ink};
`;
