import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

export const Wrap = styled.View`
  gap: ${({ theme }) => theme.spacing.small}px;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.displayBold};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.medium)}px;
  color: ${({ theme }) => theme.colors.onInk};
`;

export const GroupTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme }) => theme.colors.onInkMuted};
`;

export const Row = styled.ScrollView.attrs(({ theme }) => ({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: { gap: theme.spacing.small },
}))`
  flex-grow: 0;
`;

export const Item = styled.View<{ $checked: boolean }>`
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs}px;
  width: ${RFValue(64)}px;
  opacity: ${({ $checked }) => ($checked ? 1 : 0.6)};
`;

export const Name = styled.Text<{ $checked: boolean }>`
  font-family: ${({ theme, $checked }) => ($checked ? theme.fonts.bodyHeavy : theme.fonts.bodySemi)};
  font-size: ${({ theme }) => RFValue(theme.fontSizes.caption)}px;
  color: ${({ theme, $checked }) => ($checked ? theme.colors.onInk : theme.colors.onInkMuted)};
`;
