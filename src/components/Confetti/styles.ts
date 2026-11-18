import { RFValue } from 'react-native-responsive-fontsize';
import Animated from 'react-native-reanimated';
import styled from 'styled-components/native';

export const Layer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  align-items: center;
`;

export const Piece = styled(Animated.View)<{ $color: string; $round: boolean }>`
  position: absolute;
  top: ${RFValue(-20)}px;
  width: ${RFValue(10)}px;
  height: ${({ $round }) => RFValue($round ? 10 : 16)}px;
  border-radius: ${({ $round }) => RFValue($round ? 5 : 2)}px;
  background-color: ${({ $color }) => $color};
`;
