import { RFValue } from 'react-native-responsive-fontsize';
import Animated from 'react-native-reanimated';
import styled from 'styled-components/native';

export const Shell = styled.View`
  min-height: ${RFValue(56)}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.inkSoft};
  border-width: ${RFValue(2)}px;
  border-color: ${({ theme }) => theme.colors.blush};
  justify-content: center;
`;

export const Fill = styled(Animated.View)`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  transform-origin: left;
  background-color: ${({ theme }) => theme.colors.blush};
`;

export const Content = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
  padding: 0 ${({ theme }) => theme.spacing.large}px;
`;

export const Label = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.medium)}px;
  color: ${({ theme }) => theme.colors.onInk};
`;
