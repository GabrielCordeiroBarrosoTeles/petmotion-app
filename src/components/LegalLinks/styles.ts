import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Text = styled.Text`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  line-height: ${({ theme }) => RFValue(theme.fontSizes.caption * 1.6)}px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
`;

export const Link = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyHeavy};
  color: ${({ theme }) => theme.colors.text};
  text-decoration-line: underline;
`;
