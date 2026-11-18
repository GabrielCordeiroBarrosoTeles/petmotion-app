import { createContext, useContext } from 'react';

/**
 * Telas com formulário fornecem o `scrollToFocused` do useKeyboardAwareScroll;
 * o TextField chama ao ganhar foco (ex.: trocar de campo com o teclado já aberto).
 */
export const KeyboardScrollContext = createContext<(() => void) | null>(null);

export const useKeyboardScrollToFocused = () => useContext(KeyboardScrollContext);
