import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.ink};
`;

export const Scroll = styled.ScrollView.attrs({
  keyboardShouldPersistTaps: 'handled',
  showsVerticalScrollIndicator: false,
  bounces: false,
})`
  flex: 1;
`;

export const Hero = styled.View<{ $top: number }>`
  padding: ${({ $top }) => $top + 24}px ${({ theme }) => theme.spacing.large}px ${({ theme }) => theme.spacing.xl}px;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
`;

export const HeroText = styled(MotiView)`
  flex: 1;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const Brand = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme }) => theme.colors.onInkMuted};
`;

export const Headline = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.display + 4)}px;
  line-height: ${({ theme }) => RFValue(theme.fontSizes.display + 6)}px;
  letter-spacing: -1.5px;
  color: ${({ theme }) => theme.colors.primary};
`;

/** A folha passa da borda de baixo (margin negativa) para nunca mostrar o pinheiro embaixo enquanto sobe. */
const SHEET_OVERSCAN = 160;

export const Sheet = styled(MotiView)<{ $bottom: number }>`
  flex-grow: 1;
  background-color: ${({ theme }) => theme.colors.background};
  border-top-left-radius: ${({ theme }) => theme.radii.large}px;
  border-top-right-radius: ${({ theme }) => theme.radii.large}px;
  margin-bottom: ${-SHEET_OVERSCAN}px;
  padding: ${({ theme }) => theme.spacing.xl}px ${({ theme }) => theme.spacing.large}px
    ${({ $bottom, theme }) => $bottom + theme.spacing.large + SHEET_OVERSCAN}px;
  gap: ${({ theme }) => theme.spacing.medium}px;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.xxl)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Subtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.medium)}px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: ${({ theme }) => -theme.spacing.xs}px;
`;

export const Footer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs}px;
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

export const FooterText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const Link = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme }) => theme.colors.ink};
  text-decoration-line: underline;
`;

export const DemoHint = styled.Pressable`
  padding: ${({ theme }) => theme.spacing.small}px;
  border-radius: ${({ theme }) => theme.radii.small}px;
  background-color: ${({ theme }) => theme.colors.surfaceAlt};
`;

export const DemoText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodySemi};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
`;
