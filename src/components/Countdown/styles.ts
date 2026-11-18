import { MotiText } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Overlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.overlay};
  z-index: 50;
`;

export const Digit = styled(MotiText)`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${RFValue(160)}px;
  color: ${({ theme }) => theme.colors.primary};
`;
