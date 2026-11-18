import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

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
  padding: ${({ theme }) => theme.spacing.large}px ${({ theme }) => theme.spacing.large}px
    ${({ theme, $bottom }) => $bottom + theme.spacing.large}px;
  border-top-left-radius: ${({ theme }) => theme.radii.large}px;
  border-top-right-radius: ${({ theme }) => theme.radii.large}px;
  background-color: ${({ theme }) => theme.colors.ink};
  gap: ${({ theme }) => theme.spacing.small}px;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.xxl)}px;
  letter-spacing: -0.8px;
  color: ${({ theme }) => theme.colors.onInk};
`;

export const Message = styled.Text`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  line-height: ${({ theme }) => RFValue(theme.fontSizes.small * 1.5)}px;
  color: ${({ theme }) => theme.colors.onInkMuted};
`;

export const QrBox = styled.View`
  align-self: center;
  align-items: center;
  justify-content: center;
  width: ${RFValue(200)}px;
  height: ${RFValue(200)}px;
  border-radius: ${({ theme }) => theme.radii.medium}px;
  border-width: ${RFValue(3)}px;
  border-color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const Code = styled.Text`
  align-self: center;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.xl)}px;
  letter-spacing: 3px;
  color: ${({ theme }) => theme.colors.primary};
  font-variant: tabular-nums;
`;

export const WalkerList = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const WalkersTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme }) => theme.colors.onInk};
`;

export const WalkerRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.small}px;
  border-radius: ${({ theme }) => theme.radii.small}px;
  background-color: ${({ theme }) => theme.colors.inkSoft};
`;

export const WalkerName = styled.Text`
  flex: 1;
  font-family: ${({ theme }) => theme.fonts.bodySemi};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.medium)}px;
  color: ${({ theme }) => theme.colors.onInk};
`;

export const Close = styled.View`
  height: ${RFValue(48)}px;
  align-items: center;
  justify-content: center;
`;

export const CloseText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.medium)}px;
  color: ${({ theme }) => theme.colors.onInk};
`;
