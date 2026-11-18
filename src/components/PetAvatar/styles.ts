import { Image } from 'expo-image';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Ring = styled.View<{ $size: number; $ring: boolean }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ $size }) => $size / 2}px;
  padding: ${({ $ring }) => ($ring ? RFValue(3) : 0)}px;
  background-color: ${({ theme, $ring }) => ($ring ? theme.colors.primary : 'transparent')};
`;

export const Photo = styled(Image)`
  flex: 1;
  border-radius: 999px;
`;

export const Fallback = styled.View<{ $species: 'dog' | 'cat' }>`
  flex: 1;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $species }) => ($species === 'dog' ? theme.colors.sunSoft : theme.colors.blushSoft)};
`;

export const Initial = styled.Text<{ $size: number }>`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ $size }) => $size * 0.4}px;
  color: ${({ theme }) => theme.colors.ink};
`;
