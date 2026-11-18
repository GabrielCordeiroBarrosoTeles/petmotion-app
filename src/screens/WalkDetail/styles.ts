import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Scroll = styled.ScrollView.attrs({ showsVerticalScrollIndicator: false })`
  flex: 1;
`;

export const MapBox = styled.View<{ $height: number }>`
  height: ${({ $height }) => $height}px;
`;

export const BackWrap = styled.View<{ $top: number }>`
  position: absolute;
  top: ${({ $top }) => $top + 8}px;
  left: ${({ theme }) => theme.spacing.medium}px;
`;

export const BackButton = styled.View`
  width: ${RFValue(46)}px;
  height: ${RFValue(46)}px;
  border-radius: ${RFValue(23)}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const Body = styled.View<{ $bottom: number }>`
  margin-top: ${({ theme }) => -theme.radii.large}px;
  border-top-left-radius: ${({ theme }) => theme.radii.large}px;
  border-top-right-radius: ${({ theme }) => theme.radii.large}px;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.large}px;
  padding-bottom: ${({ $bottom }) => $bottom + 24}px;
  gap: ${({ theme }) => theme.spacing.large}px;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.xxl)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Subtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodySemi};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: ${({ theme }) => -theme.spacing.medium}px;
`;

export const Grid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.small}px;
`;

export const SectionTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.xl)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Capture = styled.View`
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Buttons = styled.View`
  gap: ${({ theme }) => theme.spacing.small}px;
`;
