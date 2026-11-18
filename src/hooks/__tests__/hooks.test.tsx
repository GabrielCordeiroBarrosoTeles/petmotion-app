import * as Location from 'expo-location';
import * as Sharing from 'expo-sharing';
import { setStatusBarStyle } from 'expo-status-bar';
import { Keyboard, Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as apiModule from '@/services/api';
import { useToastStore } from '@/store/toast';
import { useWalk } from '@/store/walk';
import { useElapsed } from '../useElapsed';
import { useFetch } from '../useFetch';
import { useKeyboardHeight } from '../useKeyboardHeight';
import { useShareView } from '../useShareView';
import { useStatusBar } from '../useStatusBar';
import { useWeather } from '../useWeather';

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  api: { weather: jest.fn() },
}));
const { api } = jest.mocked(apiModule);

describe('useKeyboardHeight', () => {
  const setOS = (os: string) => Object.defineProperty(Platform, 'OS', { value: os, configurable: true });
  afterEach(() => setOS('ios'));

  it.each([
    ['ios', 'keyboardWillShow', 'keyboardWillHide'],
    ['android', 'keyboardDidShow', 'keyboardDidHide'],
  ])('acompanha a altura do teclado no %s', async (os, showEvent, hideEvent) => {
    setOS(os);
    const listeners: Record<string, (e?: unknown) => void> = {};
    const remove = jest.fn();
    jest.spyOn(Keyboard, 'addListener').mockImplementation(((event: string, cb: (e?: unknown) => void) => {
      listeners[event] = cb;
      return { remove };
    }) as never);

    const { result, unmount } = await renderHook(() => useKeyboardHeight());
    await act(() => listeners[showEvent]({ endCoordinates: { height: 320 } }));
    expect(result.current).toBe(320);
    await act(() => listeners[hideEvent]());
    expect(result.current).toBe(0);

    await unmount();
    expect(remove).toHaveBeenCalledTimes(2);
  });
});

describe('useFetch', () => {
  it('carrega, recarrega no foco, no pull e permite editar os dados', async () => {
    const fetcher = jest.fn<Promise<number[] | string[]>, []>().mockResolvedValueOnce([1]).mockResolvedValueOnce([1, 2]).mockResolvedValueOnce([3]);
    const { result } = await renderHook(() => useFetch(fetcher));
    await waitFor(() => expect(result.current.data).toEqual([1]));
    expect(result.current.loading).toBe(false);

    await act(async () => global.__focus());
    await waitFor(() => expect(result.current.data).toEqual([1, 2]));

    await act(() => result.current.refetch('pull'));
    expect(result.current.data).toEqual([3]);
    expect(result.current.refreshing).toBe(false);

    await act(() => result.current.setData((prev) => [...((prev as number[] | null) ?? []), 4]));
    expect(result.current.data).toEqual([3, 4]);

    fetcher.mockResolvedValueOnce(['silent']);
    await act(() => result.current.refetch());
    expect(result.current.data).toEqual(['silent']);
  });

  it('guarda a mensagem de erro amigável', async () => {
    const { result } = await renderHook(() => useFetch(() => Promise.reject(new Error('x'))));
    await waitFor(() => expect(result.current.error).toBe('Algo deu errado. Tente de novo.'));
  });

  it('desligado não busca nem no foco', async () => {
    const fetcher = jest.fn();
    const { result } = await renderHook(() => useFetch(fetcher, { enabled: false }));
    await act(async () => global.__focus());
    expect(fetcher).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('busca de novo quando as dependências mudam', async () => {
    const fetcher = jest.fn((id: number) => Promise.resolve(id));
    const { result, rerender } = await renderHook(({ id }: { id: number }) => useFetch(() => fetcher(id), { deps: [id] }), {
      initialProps: { id: 1 },
    });
    await waitFor(() => expect(result.current.data).toBe(1));
    await rerender({ id: 2 });
    await waitFor(() => expect(result.current.data).toBe(2));
  });
});

describe('useWeather', () => {
  const weather = { air_c: 20, asphalt_c: 45, is_day: true, uv_index: 3, level: 'warning', message: 'm' };

  it('busca o clima da posição atual', async () => {
    api.weather.mockResolvedValueOnce(weather as never);
    const { result } = await renderHook(() => useWeather());
    await waitFor(() => expect(result.current.weather).toEqual(weather));
    expect(result.current.coords).toEqual([-23.5, -46.6]);
    expect(result.current.loading).toBe(false);
  });

  it('usa a posição atual quando não há última conhecida', async () => {
    jest.mocked(Location.getLastKnownPositionAsync).mockResolvedValueOnce(null);
    api.weather.mockResolvedValueOnce(weather as never);
    const { result } = await renderHook(() => useWeather());
    await waitFor(() => expect(result.current.weather).not.toBeNull());
    expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
  });

  it('sem permissão ou com erro, só não mostra o clima', async () => {
    jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValueOnce({ granted: false } as never);
    const denied = await renderHook(() => useWeather());
    await waitFor(() => expect(denied.result.current.loading).toBe(false));
    expect(denied.result.current.weather).toBeNull();

    api.weather.mockRejectedValueOnce(new Error('503'));
    const failed = await renderHook(() => useWeather());
    await waitFor(() => expect(failed.result.current.loading).toBe(false));
    expect(failed.result.current.weather).toBeNull();
  });

  it('não atualiza o estado depois de desmontar', async () => {
    let resolve: (w: unknown) => void = () => undefined;
    api.weather.mockReturnValueOnce(new Promise((r) => (resolve = r)) as never);
    const { result, unmount } = await renderHook(() => useWeather());
    await waitFor(() => expect(api.weather).toHaveBeenCalled());
    await unmount();
    await act(async () => resolve(weather));
    expect(result.current.weather).toBeNull();
  });
});

describe('useElapsed', () => {
  beforeEach(() => jest.useFakeTimers().setSystemTime(new Date('2026-11-17T18:00:00Z')));
  afterEach(async () => {
    await act(() => useWalk.getState().reset());
    jest.useRealTimers();
  });

  it('conta os segundos só enquanto o passeio roda', async () => {
    useWalk.setState({ status: 'running', accumulatedMs: 5000, resumedAt: Date.now() });
    const { result } = await renderHook(() => useElapsed());
    expect(result.current.elapsedSeconds).toBe(5);
    await act(() => jest.advanceTimersByTime(3000));
    expect(result.current.elapsedSeconds).toBe(8);

    await act(() => useWalk.setState({ status: 'paused', accumulatedMs: 8000, resumedAt: null }));
    await act(() => jest.advanceTimersByTime(5000));
    expect(result.current.elapsedSeconds).toBe(8);
  });
});

describe('useStatusBar', () => {
  it('troca o estilo no foco e volta ao escuro ao sair', async () => {
    const { unmount } = await renderHook(() => useStatusBar('light'));
    expect(setStatusBarStyle).toHaveBeenCalledWith('light', true);
    await unmount();
    expect(setStatusBarStyle).toHaveBeenLastCalledWith('dark', true);
  });
});

describe('useShareView', () => {
  it('captura a view e abre o compartilhamento', async () => {
    const { result } = await renderHook(() => useShareView());
    (result.current.ref as { current: unknown }).current = {};
    await act(() => result.current.share('Passeio do Thor'));
    expect(captureRef).toHaveBeenCalled();
    expect(Sharing.shareAsync).toHaveBeenCalledWith('file://card.png', expect.objectContaining({ dialogTitle: 'Passeio do Thor' }));
    expect(result.current.sharing).toBe(false);
  });

  it('não faz nada sem a view montada', async () => {
    const { result } = await renderHook(() => useShareView());
    await act(() => result.current.share('x'));
    expect(captureRef).not.toHaveBeenCalled();
  });

  it('avisa quando não dá para compartilhar ou a captura falha', async () => {
    const { result } = await renderHook(() => useShareView());
    (result.current.ref as { current: unknown }).current = {};

    jest.mocked(Sharing.isAvailableAsync).mockResolvedValueOnce(false);
    await act(() => result.current.share('x'));
    expect(useToastStore.getState().current?.message).toMatch(/indisponível/);

    jest.mocked(captureRef).mockRejectedValueOnce(new Error('x'));
    await act(() => result.current.share('x'));
    expect(useToastStore.getState().current?.message).toMatch(/Não foi possível/);
  });
});
