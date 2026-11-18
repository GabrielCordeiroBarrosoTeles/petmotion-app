import { RFValue } from 'react-native-responsive-fontsize';
import { CameraView } from 'expo-camera';
import styled from 'styled-components/native';

export const Screen = styled.View<{ $top: number; $bottom: number }>`
  flex: 1;
  padding-top: ${({ $top }) => $top}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Body = styled.View<{ $bottom: number }>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.medium}px ${({ theme }) => theme.spacing.large}px
    ${({ theme, $bottom }) => $bottom + theme.spacing.large}px;
  gap: ${({ theme }) => theme.spacing.medium}px;
  justify-content: center;
`;

export const Frame = styled.View`
  flex: 1;
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
