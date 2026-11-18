import { type ComponentRef, useCallback, useEffect, useRef } from 'react';
import { type NativeScrollEvent, type NativeSyntheticEvent, type ScrollView, TextInput, useWindowDimensions } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import type { UseKeyboardAwareScrollResult } from './types';
import { useKeyboardHeight } from './useKeyboardHeight';

/** Tempo para o padding do teclado ser aplicado antes de rolar. */
const LAYOUT_DELAY_MS = 60;

/**
 * Mantém o campo em foco visível acima do teclado: ao abrir o teclado (ou trocar de campo),
 * mede o campo na tela e rola o ScrollView só o necessário. Usa o ScrollView nativo + useKeyboardHeight.
 */
export function useKeyboardAwareScroll(margin = RFValue(24)): UseKeyboardAwareScrollResult {
  const keyboardHeight = useKeyboardHeight();
  const { height: windowHeight } = useWindowDimensions();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const scrollY = useRef(0);
  const keyboardRef = useRef(keyboardHeight);
  keyboardRef.current = keyboardHeight;

  const scrollToFocused = useCallback(() => {
    setTimeout(() => {
      const input = TextInput.State.currentlyFocusedInput();
      if (!input || !scrollRef.current || keyboardRef.current === 0) return;
      input.measureInWindow((_x, y, _width, height) => {
        const visibleBottom = windowHeight - keyboardRef.current - margin;
        const overflow = y + height - visibleBottom;
        if (overflow > 0) scrollRef.current?.scrollTo({ y: scrollY.current + overflow, animated: true });
      });
    }, LAYOUT_DELAY_MS);
  }, [windowHeight, margin]);

  useEffect(() => {
    if (keyboardHeight > 0) scrollToFocused();
  }, [keyboardHeight, scrollToFocused]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = e.nativeEvent.contentOffset.y;
  }, []);

  return { scrollRef, keyboardHeight, onScroll, scrollToFocused };
}
