import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Scroll = styled.ScrollView.attrs({ showsVerticalScrollIndicator: false })`
  flex: 1;
`;

export const Content = styled.View<{ $top: number; $bottom: number }>`
  padding: ${({ $top }) => $top + 24}px ${({ theme }) => theme.spacing.large}px ${({ $bottom }) => $bottom + 24}px;
  gap: ${({ theme }) => theme.spacing.large}px;
`;

export const Heading = styled(MotiView)`
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.display + 4)}px;
  line-height: ${({ theme }) => RFValue((theme.fontSizes.display + 4) * 1.05)}px;
  letter-spacing: -1.2px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Subtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.medium)}px;
  line-height: ${({ theme }) => RFValue(theme.fontSizes.medium * 1.5)}px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const CardWrap = styled(MotiView)``;

export const Capture = styled.View`
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Buttons = styled.View`
  gap: ${({ theme }) => theme.spacing.small}px;
`;
