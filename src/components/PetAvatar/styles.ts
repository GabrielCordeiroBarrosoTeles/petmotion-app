import { Image } from 'expo-image';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

/** Aro de seleção: contorno bola com um respiro entre o aro e a foto (raio pill: funciona igual no Android). */
export const Ring = styled.View<{ $size: number; $ring: boolean }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  padding: ${({ $ring }) => ($ring ? RFValue(3) : 0)}px;
  border-width: ${({ $ring }) => ($ring ? RFValue(2.5) : 0)}px;
  border-color: ${({ theme }) => theme.colors.primary};
`;

export const Photo = styled(Image)`
  flex: 1;
  border-radius: ${({ theme }) => theme.radii.pill}px;
`;

export const Fallback = styled.View<{ $species: 'dog' | 'cat' }>`
  flex: 1;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $species }) => ($species === 'dog' ? theme.colors.sunSoft : theme.colors.blushSoft)};
`;

export const Initial = styled.Text<{ $size: number }>`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ $size }) => $size * 0.4}px;
  color: ${({ theme }) => theme.colors.ink};
`;
