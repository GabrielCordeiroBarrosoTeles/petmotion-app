import { RFValue } from 'react-native-responsive-fontsize';
import Animated from 'react-native-reanimated';
import styled from 'styled-components/native';

export const Container = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const Label = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Track = styled.View`
  flex-direction: row;
  padding: ${RFValue(4)}px;
  border-radius: ${({ theme }) => theme.radii.medium}px;
  background-color: ${({ theme }) => theme.colors.surfaceAlt};
`;

export const Indicator = styled(Animated.View)`
  position: absolute;
  top: ${RFValue(4)}px;
  bottom: ${RFValue(4)}px;
  left: ${RFValue(4)}px;
  border-radius: ${({ theme }) => theme.radii.small + 4}px;
  background-color: ${({ theme }) => theme.colors.ink};
`;

export const Option = styled.Pressable`
  flex: 1;
  min-height: ${RFValue(46)}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xxs}px;
`;

export const OptionText = styled.Text<{ $active: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.small)}px;
  color: ${({ theme, $active }) => ($active ? theme.colors.onInk : theme.colors.textMuted)};
`;
