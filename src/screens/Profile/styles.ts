import { Image } from 'expo-image';
import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Screen = styled.View<{ $top: number }>`
  flex: 1;
  padding-top: ${({ $top }) => $top}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Scroll = styled.ScrollView.attrs({ showsVerticalScrollIndicator: false })`
  flex: 1;
`;

export const Content = styled.View<{ $bottom: number }>`
  padding: 0 ${({ theme }) => theme.spacing.large}px ${({ $bottom }) => $bottom}px;
  gap: ${({ theme }) => theme.spacing.large}px;
`;

export const UserCard = styled(MotiView)`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.medium}px;
  padding: ${({ theme }) => theme.spacing.large}px;
  border-radius: ${({ theme }) => theme.radii.large}px;
  background-color: ${({ theme }) => theme.colors.ink};
`;

export const Initials = styled.View`
  width: ${RFValue(60)}px;
  height: ${RFValue(60)}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
`;

/** Foto do usuário: preenche o círculo das iniciais. */
export const UserPhoto = styled(Image)`
  width: 100%;
  height: 100%;
`;

export const InitialsText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.xl)}px;
  color: ${({ theme }) => theme.colors.ink};
`;

export const UserTexts = styled.View`
  flex: 1;
`;

export const UserName = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.xl)}px;
  color: ${({ theme }) => theme.colors.onInk};
`;

export const UserEmail = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodySemi};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme }) => theme.colors.onInkMuted};
`;

export const Section = styled.View`
  gap: ${({ theme }) => theme.spacing.small}px;
`;

export const SectionTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.xl)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Panel = styled.View`
  border-radius: ${({ theme }) => theme.radii.medium}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const Divider = styled.View`
  height: 1px;
  margin: 0 ${({ theme }) => theme.spacing.medium}px;
  background-color: ${({ theme }) => theme.colors.line};
`;

export const Version = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodySemi};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
`;
