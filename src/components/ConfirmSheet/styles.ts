import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';
import type { ConfirmBadgeProps } from './types';

export const BADGE = RFValue(76);

export const Backdrop = styled(MotiView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.overlay};
`;

export const BackdropPress = styled.Pressable`
  flex: 1;
`;

export const Sheet = styled(MotiView)<{ $bottom: number }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: ${({ theme }) => BADGE / 2 + theme.spacing.medium}px ${({ theme }) => theme.spacing.large}px
    ${({ theme, $bottom }) => $bottom + theme.spacing.large}px;
  border-top-left-radius: ${({ theme }) => theme.radii.large}px;
  border-top-right-radius: ${({ theme }) => theme.radii.large}px;
  background-color: ${({ theme }) => theme.colors.ink};
  gap: ${({ theme }) => theme.spacing.small}px;
`;

/** O selo fica metade fora da folha, encaixado num aro pinheiro (o mesmo "suporte" da bola na tab bar). */
export const Badge = styled(MotiView)<ConfirmBadgeProps>`
  position: absolute;
  top: ${-BADGE / 2}px;
  left: ${({ theme }) => theme.spacing.large}px;
  width: ${BADGE}px;
  height: ${BADGE}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  border-width: ${RFValue(6)}px;
  border-color: ${({ theme }) => theme.colors.ink};
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $tone }) => ($tone === 'danger' ? theme.colors.blush : theme.colors.primary)};
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.xxl)}px;
  letter-spacing: -0.8px;
  color: ${({ theme }) => theme.colors.onInk};
`;

export const Message = styled.Text`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.medium)}px;
  line-height: ${({ theme }) => RFValue(theme.fontSizes.medium * 1.5)}px;
  color: ${({ theme }) => theme.colors.onInkMuted};
  margin-bottom: ${({ theme }) => theme.spacing.small}px;
`;

export const Cancel = styled.View`
  height: ${RFValue(48)}px;
  align-items: center;
  justify-content: center;
`;

export const CancelText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.medium)}px;
  color: ${({ theme }) => theme.colors.onInk};
`;
