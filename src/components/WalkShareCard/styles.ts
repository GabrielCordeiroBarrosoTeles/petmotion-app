import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Card = styled.View`
  border-radius: ${({ theme }) => theme.radii.large}px;
  background-color: ${({ theme }) => theme.colors.ink};
  padding: ${({ theme }) => theme.spacing.large}px;
  gap: ${({ theme }) => theme.spacing.medium}px;
  overflow: hidden;
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small}px;
`;

/** Avatares sobrepostos do passeio em grupo. */
export const Overlap = styled.View<{ $first: boolean }>`
  margin-left: ${({ $first, theme }) => ($first ? 0 : -theme.spacing.small - theme.spacing.xs)}px;
`;

export const HeaderTexts = styled.View`
  flex: 1;
`;

export const PetName = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.xl)}px;
  color: ${({ theme }) => theme.colors.onInk};
`;

export const When = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodySemi};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme }) => theme.colors.onInkMuted};
`;

/** Com mapa, a caixa tem altura fixa e corta o mapa nos cantos arredondados. */
export const RouteBox = styled.View<{ $map: boolean; $height: number }>`
  align-items: center;
  justify-content: center;
  overflow: hidden;
  ${({ $map, $height }) => ($map ? `height: ${$height}px; align-items: stretch;` : '')}
  border-radius: ${({ theme }) => theme.radii.medium}px;
  background-color: ${({ theme }) => theme.colors.inkSoft};
`;

export const Numbers = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const Number = styled.View`
  gap: ${RFValue(2)}px;
`;

export const Big = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.xxl + 4)}px;
  letter-spacing: -1px;
  color: ${({ theme }) => theme.colors.primary};
`;

export const Small = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme }) => theme.colors.onInkMuted};
`;

export const Brand = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const BrandDot = styled.View`
  width: ${RFValue(14)}px;
  height: ${RFValue(14)}px;
  border-radius: ${RFValue(7)}px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const BrandText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme }) => theme.colors.onInkMuted};
`;
