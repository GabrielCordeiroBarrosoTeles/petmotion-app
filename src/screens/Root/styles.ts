import type { NativeStackNavigationOptions } from 'expo-router/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import styled from 'styled-components/native';
import { theme } from '@/theme';

export const GestureRoot = styled(GestureHandlerRootView)`
  flex: 1;
`;

export const RootView = styled.View`
  flex: 1;
  background-color: ${({ theme: t }) => t.colors.background};
`;

export const stackOptions: NativeStackNavigationOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: theme.colors.background },
  animation: 'slide_from_right',
};
