import { RFValue } from 'react-native-responsive-fontsize';
import { CameraView } from 'expo-camera';
import styled from 'styled-components/native';

export const Screen = styled.View<{ $top: number }>`
  flex: 1;
  padding-top: ${({ $top }) => $top}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Scroll = styled.ScrollView.attrs({ keyboardShouldPersistTaps: 'handled' })`
  flex: 1;
`;

export const Body = styled.View<{ $bottom: number }>`
  padding: ${({ theme }) => theme.spacing.medium}px ${({ theme }) => theme.spacing.large}px
    ${({ theme, $bottom }) => $bottom + theme.spacing.large}px;
  gap: ${({ theme }) => theme.spacing.medium}px;
`;

/** Quadrado: o QR cabe inteiro e sobra espaço para digitar o código embaixo. */
export const Frame = styled.View`
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.large}px;
  border-width: ${RFValue(4)}px;
  border-color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.ink};
`;

export const Camera = styled(CameraView)`
  flex: 1;
`;

export const Hint = styled.Text`
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.bodySemi};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.medium)}px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const Manual = styled.View`
  gap: ${({ theme }) => theme.spacing.small}px;
  padding-top: ${({ theme }) => theme.spacing.xs}px;
`;
