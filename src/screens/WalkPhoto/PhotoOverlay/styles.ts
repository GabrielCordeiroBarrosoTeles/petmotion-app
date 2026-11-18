import { LinearGradient } from 'expo-linear-gradient';
import { RFValue } from 'react-native-responsive-fontsize';
import styled, { css } from 'styled-components/native';

const shadow = css`
  text-shadow-color: ${({ theme }) => theme.colors.photoShadow};
  text-shadow-offset: 0px 1px;
  text-shadow-radius: 6px;
`;

export const Fill = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

/** Degradê de legibilidade: escurece o topo ou a base da foto onde ficam os números. */
export const Scrim = styled(LinearGradient)<{ $edge: 'top' | 'bottom'; $height: number }>`
  position: absolute;
  left: 0;
  right: 0;
  ${({ $edge }) => ($edge === 'top' ? 'top: 0;' : 'bottom: 0;')}
  height: ${({ $height }) => $height}px;
`;

export const Corner = styled.View<{ $align: 'left' | 'right' }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing.large}px;
  ${({ $align, theme }) => ($align === 'left' ? `left: ${theme.spacing.large}px;` : `right: ${theme.spacing.large}px;`)}
`;

export const Grid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  width: ${RFValue(190)}px;
  row-gap: ${({ theme }) => theme.spacing.small}px;
`;

export const Cell = styled.View`
  width: 50%;
`;

export const StatLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${RFValue(10)}px;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.9;
  ${shadow}
`;

export const StatValue = styled.Text<{ $big?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ $big }) => RFValue($big ? 30 : 20)}px;
  letter-spacing: -0.5px;
  color: ${({ theme }) => theme.colors.white};
  ${shadow}
`;

export const RouteLayer = styled.View<{ $top: number; $left: number }>`
  position: absolute;
  top: ${({ $top }) => $top}px;
  left: ${({ $left }) => $left}px;
`;

export const Stack = styled.View`
  position: absolute;
  top: 0;
  left: 0;
`;

export const Bottom = styled.View`
  position: absolute;
  left: ${({ theme }) => theme.spacing.large}px;
  right: ${({ theme }) => theme.spacing.large}px;
  bottom: ${({ theme }) => theme.spacing.large}px;
  gap: ${({ theme }) => theme.spacing.small}px;
`;

export const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

export const Band = styled.View`
  position: absolute;
  left: ${({ theme }) => theme.spacing.medium}px;
  right: ${({ theme }) => theme.spacing.medium}px;
  bottom: ${({ theme }) => theme.spacing.medium}px;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.medium}px;
  padding: ${({ theme }) => theme.spacing.medium}px;
  border-radius: ${({ theme }) => theme.radii.medium}px;
  background-color: ${({ theme }) => theme.colors.photoScrim};
`;

export const BandStats = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const Brand = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const BrandDot = styled.View`
  width: ${RFValue(12)}px;
  height: ${RFValue(12)}px;
  border-radius: ${RFValue(6)}px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const BrandText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.white};
  ${shadow}
`;
