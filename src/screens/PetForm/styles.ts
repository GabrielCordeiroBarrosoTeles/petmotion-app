import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Screen = styled.View<{ $top: number }>`
  flex: 1;
  padding-top: ${({ $top }) => $top}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Scroll = styled.ScrollView.attrs({ keyboardShouldPersistTaps: 'handled', showsVerticalScrollIndicator: false })`
  flex: 1;
`;

export const Form = styled.View<{ $bottom: number }>`
  padding: 0 ${({ theme }) => theme.spacing.large}px ${({ $bottom }) => $bottom + 24}px;
  gap: ${({ theme }) => theme.spacing.large}px;
`;

export const PhotoArea = styled(MotiView)`
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small}px;
`;

export const PhotoBadge = styled.View`
  position: absolute;
  right: ${RFValue(-2)}px;
  bottom: ${RFValue(-2)}px;
  width: ${RFValue(40)}px;
  height: ${RFValue(40)}px;
  border-radius: ${RFValue(20)}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.ink};
  border-width: ${RFValue(3)}px;
  border-color: ${({ theme }) => theme.colors.background};
`;

export const PhotoButtons = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const Row = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.small}px;
`;

export const Half = styled.View`
  flex: 1;
`;
