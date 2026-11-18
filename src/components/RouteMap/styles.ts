import MapView from 'react-native-maps';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';
import type { WalkEventType } from '@/services/types';

export const Map = styled(MapView)`
  flex: 1;
`;

export const Pin = styled.View<{ $type: WalkEventType }>`
  width: ${RFValue(30)}px;
  height: ${RFValue(30)}px;
  border-radius: ${RFValue(15)}px;
  align-items: center;
  justify-content: center;
  border-width: ${RFValue(2.5)}px;
  border-color: ${({ theme }) => theme.colors.white};
  background-color: ${({ theme, $type }) =>
    ({ pee: theme.colors.sun, poop: theme.colors.earth, water: theme.colors.sky })[$type]};
`;

export const Me = styled.View`
  width: ${RFValue(22)}px;
  height: ${RFValue(22)}px;
  border-radius: ${RFValue(11)}px;
  border-width: ${RFValue(4)}px;
  border-color: ${({ theme }) => theme.colors.white};
  background-color: ${({ theme }) => theme.colors.ink};
`;

export const Start = styled.View`
  width: ${RFValue(14)}px;
  height: ${RFValue(14)}px;
  border-radius: ${RFValue(7)}px;
  border-width: ${RFValue(3)}px;
  border-color: ${({ theme }) => theme.colors.ink};
  background-color: ${({ theme }) => theme.colors.primary};
`;
