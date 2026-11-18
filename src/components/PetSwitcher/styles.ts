import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Row = styled.ScrollView.attrs(({ theme }) => ({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: { gap: theme.spacing.small, paddingHorizontal: theme.spacing.large },
}))`
  flex-grow: 0;
`;

export const Item = styled.View`
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs}px;
  width: ${RFValue(64)}px;
`;

export const Name = styled.Text<{ $active: boolean }>`
  font-family: ${({ theme, $active }) => ($active ? theme.fonts.bodyHeavy : theme.fonts.bodySemi)};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme, $active }) => ($active ? theme.colors.onInk : theme.colors.onInkMuted)};
`;

export const AddCircle = styled.View`
  width: ${RFValue(56)}px;
  height: ${RFValue(56)}px;
  border-radius: ${RFValue(28)}px;
  border-width: ${RFValue(2)}px;
  border-style: dashed;
  border-color: ${({ theme }) => theme.colors.inkLine};
  align-items: center;
  justify-content: center;
`;
