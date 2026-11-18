import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled, { type DefaultTheme } from 'styled-components/native';
import type { StatTone } from './types';

export const toneColor = (theme: DefaultTheme, tone: StatTone) =>
  ({
    surface: theme.colors.surface,
    sun: theme.colors.sunSoft,
    sky: theme.colors.skySoft,
    blush: theme.colors.blushSoft,
    ink: theme.colors.ink,
  })[tone];

export const Tile = styled(MotiView)<{ $tone: StatTone }>`
  flex: 1;
  min-width: 45%;
  padding: ${({ theme }) => theme.spacing.medium}px;
  border-radius: ${({ theme }) => theme.radii.medium}px;
  gap: ${({ theme }) => theme.spacing.xs}px;
  background-color: ${({ theme, $tone }) => toneColor(theme, $tone)};
`;

export const Top = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const Label = styled.Text<{ $onInk: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme, $onInk }) => ($onInk ? theme.colors.onInkMuted : theme.colors.textMuted)};
`;

export const ValueRow = styled.View`
  flex-direction: row;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing.xxs}px;
`;

export const Unit = styled.Text<{ $onInk: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme, $onInk }) => ($onInk ? theme.colors.onInkMuted : theme.colors.textMuted)};
`;
