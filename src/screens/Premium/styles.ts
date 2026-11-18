import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.ink};
`;

export const Scroll = styled.ScrollView.attrs({ showsVerticalScrollIndicator: false, bounces: false })`
  flex: 1;
`;

export const Content = styled.View<{ $top: number; $bottom: number }>`
  padding: ${({ $top }) => $top + 12}px ${({ theme }) => theme.spacing.large}px ${({ $bottom }) => $bottom + 24}px;
  gap: ${({ theme }) => theme.spacing.large}px;
`;

export const Close = styled.View`
  align-self: flex-end;
  width: ${RFValue(40)}px;
  height: ${RFValue(40)}px;
  border-radius: ${RFValue(20)}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.inkSoft};
`;

export const Balls = styled.View`
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.small}px;
  margin-top: ${({ theme }) => -theme.spacing.large}px;
`;

export const Heading = styled(MotiView)`
  gap: ${({ theme }) => theme.spacing.small}px;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.hero - 14)}px;
  line-height: ${({ theme }) => RFValue(theme.fontSizes.hero - 12)}px;
  letter-spacing: -1.4px;
  color: ${({ theme }) => theme.colors.onInk};
`;

export const Lede = styled.Text`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.medium)}px;
  line-height: ${({ theme }) => RFValue(theme.fontSizes.medium * 1.5)}px;
  color: ${({ theme }) => theme.colors.onInkMuted};
`;

export const Benefits = styled.View`
  gap: ${({ theme }) => theme.spacing.medium}px;
`;

export const Plans = styled(MotiView)`
  gap: ${({ theme }) => theme.spacing.medium}px;
  padding-top: ${({ theme }) => theme.spacing.xs}px;
`;

export const FinePrint = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodySemi};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  line-height: ${({ theme }) => RFValue(theme.fontSizes.caption * 1.5)}px;
  color: ${({ theme }) => theme.colors.onInkMuted};
  text-align: center;
`;

export const Welcome = styled(MotiView)<{ $top: number; $bottom: number }>`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.large}px;
  padding: ${({ $top }) => $top + 24}px ${({ theme }) => theme.spacing.large}px ${({ $bottom }) => $bottom + 24}px;
`;

export const Medal = styled(MotiView)`
  width: ${RFValue(132)}px;
  height: ${RFValue(132)}px;
  border-radius: ${RFValue(66)}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
  border-width: ${RFValue(6)}px;
  border-color: ${({ theme }) => theme.colors.inkSoft};
`;

export const WelcomeTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.display + 4)}px;
  letter-spacing: -1px;
  color: ${({ theme }) => theme.colors.onInk};
  text-align: center;
`;

export const WelcomeBody = styled.Text`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.medium)}px;
  line-height: ${({ theme }) => RFValue(theme.fontSizes.medium * 1.5)}px;
  color: ${({ theme }) => theme.colors.onInkMuted};
  text-align: center;
`;

export const FullWidth = styled.View`
  align-self: stretch;
`;
