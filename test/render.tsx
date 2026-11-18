import { act, render, renderHook, screen, type RenderOptions } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';
import { ThemeProvider } from 'styled-components/native';
import { useConfirmStore } from '@/store/confirm';
import { theme } from '@/theme';

function Providers({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

/** Renderiza com o tema (inclusive nos rerender). Na RNTL 14 o render é assíncrono. */
export function renderWithTheme(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: Providers, ...options });
}

export function renderHookWithTheme<R, P>(hook: (props: P) => R, options?: { initialProps?: P }) {
  return renderHook(hook, { wrapper: Providers, ...options });
}

export * from '@testing-library/react-native';

type Node = { props?: Record<string, any>; children?: Array<Node | string> };

function findNode(node: Node | string | undefined, match: (n: Node) => boolean): Node | undefined {
  if (!node || typeof node === 'string') return undefined;
  if (match(node)) return node;
  for (const child of node.children ?? []) {
    const found = findNode(child, match);
    if (found) return found;
  }
  return undefined;
}

/** Simula o gesto de "puxar para atualizar" da primeira lista/scroll da tela. */
export async function pullToRefresh() {
  const scroll = findNode(screen.root as unknown as Node, (n) => !!n.props?.refreshControl);
  if (!scroll) throw new Error('Nenhum RefreshControl na tela');
  await act(() => scroll.props!.refreshControl.props.onRefresh());
}

/**
 * Simula a rolagem até o fim de uma FlatList (dispara onEndReached).
 * Com `{ wait: false }` não espera a busca terminar: útil para ver o estado "carregando".
 */
export async function scrollToEnd({ wait = true }: { wait?: boolean } = {}) {
  const list = findNode(screen.root as unknown as Node, (n) => typeof n.props?.onEndReached === 'function');
  if (!list) throw new Error('Nenhuma lista com onEndReached na tela');
  if (wait) {
    await act(() => list.props!.onEndReached({ distanceFromEnd: 0 }));
    return;
  }
  await act(() => {
    list.props!.onEndReached({ distanceFromEnd: 0 });
  });
}

/** Responde a folha de confirmação (ConfirmHost) e deixa a ação seguinte terminar. */
export async function answerConfirm(ok: boolean) {
  await act(async () => {
    useConfirmStore.getState().answer(ok);
    for (let i = 0; i < 10; i += 1) await Promise.resolve();
  });
}
