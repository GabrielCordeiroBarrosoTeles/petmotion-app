import { Keyboard, Platform, TextInput } from 'react-native';
import * as SafeArea from 'react-native-safe-area-context';
import { act, fireEvent, renderHook, renderWithTheme, screen } from '../../../test/render';
import { TextField } from '@/components/TextField';
import { KeyboardScrollContext } from '../KeyboardScrollContext';
import { useKeyboardAwareScroll } from '../useKeyboardAwareScroll';
import { useModalTopInset } from '../useModalTopInset';
import { useSafeInsets } from '../useSafeInsets';

const setOS = (os: string) => Object.defineProperty(Platform, 'OS', { value: os, configurable: true });

describe('useSafeInsets', () => {
  const safeAreaMock = jest.requireMock('react-native-safe-area-context');
  const original = safeAreaMock.initialWindowMetrics;
  afterEach(() => {
    safeAreaMock.initialWindowMetrics = original;
    jest.restoreAllMocks();
  });

  it('usa a medida da abertura do app quando a tela (modal) informa zero', async () => {
    jest.spyOn(SafeArea, 'useSafeAreaInsets').mockReturnValue({ top: 0, bottom: 0, left: 1, right: 2 });
    safeAreaMock.initialWindowMetrics = { insets: { top: 30, bottom: 48 } };
    const { result } = await renderHook(() => useSafeInsets());
    expect(result.current).toEqual({ top: 30, bottom: 48, left: 1, right: 2 });
  });

  it('fica com o valor da tela quando ele é maior ou quando não há medida inicial', async () => {
    jest.spyOn(SafeArea, 'useSafeAreaInsets').mockReturnValue({ top: 50, bottom: 20, left: 0, right: 0 });
    safeAreaMock.initialWindowMetrics = null;
    const { result } = await renderHook(() => useSafeInsets());
    expect(result.current).toMatchObject({ top: 50, bottom: 20 });
  });
});

describe('useModalTopInset', () => {
  afterEach(() => {
    setOS('ios');
    jest.restoreAllMocks();
  });

  it('no Android reserva a barra de status; no iOS não', async () => {
    jest.spyOn(SafeArea, 'useSafeAreaInsets').mockReturnValue({ top: 24, bottom: 0, left: 0, right: 0 });
    const ios = await renderHook(() => useModalTopInset());
    expect(ios.result.current).toBe(0);
    setOS('android');
    const android = await renderHook(() => useModalTopInset());
    expect(android.result.current).toBe(24);
  });
});

describe('useKeyboardAwareScroll', () => {
  let show: (e: unknown) => void = () => undefined;
  let hide: () => void = () => undefined;
  const scrollTo = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(Keyboard, 'addListener').mockImplementation(((event: string, cb: (e?: unknown) => void) => {
      if (event.endsWith('Show')) show = cb;
      else hide = cb as () => void;
      return { remove: jest.fn() };
    }) as never);
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  /** Campo em foco que está a `y` px do topo da janela, com 50px de altura. */
  const focusInputAt = (y: number) =>
    jest.spyOn(TextInput.State, 'currentlyFocusedInput').mockReturnValue({
      measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => cb(0, y, 300, 50),
    } as never);

  async function setup() {
    const hook = await renderHook(() => useKeyboardAwareScroll(20));
    (hook.result.current.scrollRef as { current: unknown }).current = { scrollTo };
    return hook;
  }

  it('rola só o necessário para o campo ficar acima do teclado', async () => {
    const { result } = await setup();
    focusInputAt(600); // fundo do campo em 650
    await act(() => result.current.onScroll({ nativeEvent: { contentOffset: { y: 100 } } } as never));
    await act(() => show({ endCoordinates: { height: 300 } }));
    await act(() => jest.advanceTimersByTime(60));
    // janela de teste = 1334; área visível termina em 1334 - 300 - 20 = 1014: campo já visível
    expect(scrollTo).not.toHaveBeenCalled();

    focusInputAt(1100); // fundo em 1150: passa 136 da área visível
    await act(() => result.current.scrollToFocused());
    await act(() => jest.advanceTimersByTime(60));
    expect(scrollTo).toHaveBeenCalledWith({ y: 236, animated: true });
  });

  it('não faz nada sem campo em foco, sem scroll ou com o teclado fechado', async () => {
    const { result } = await setup();
    jest.spyOn(TextInput.State, 'currentlyFocusedInput').mockReturnValue(null as never);
    await act(() => show({ endCoordinates: { height: 300 } }));
    await act(() => jest.advanceTimersByTime(60));

    focusInputAt(1200);
    (result.current.scrollRef as { current: unknown }).current = null;
    await act(() => result.current.scrollToFocused());
    await act(() => jest.advanceTimersByTime(60));

    (result.current.scrollRef as { current: unknown }).current = { scrollTo };
    await act(() => hide());
    await act(() => result.current.scrollToFocused());
    await act(() => jest.advanceTimersByTime(60));
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('usa a margem padrão', async () => {
    const { result } = await renderHook(() => useKeyboardAwareScroll());
    expect(result.current.keyboardHeight).toBe(0);
  });
});

describe('TextField dentro de um formulário com teclado', () => {
  it('pede para rolar até ele ao ganhar foco', async () => {
    const scrollToFocused = jest.fn();
    await renderWithTheme(
      <KeyboardScrollContext.Provider value={scrollToFocused}>
        <TextField label="Nome" />
      </KeyboardScrollContext.Provider>,
    );
    await fireEvent(screen.getByLabelText('Nome'), 'focus');
    expect(scrollToFocused).toHaveBeenCalled();
  });
});
