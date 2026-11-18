import { useFonts } from 'expo-font';
import { useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { act, renderWithTheme, screen, waitFor } from '../../../test/render';
import { makePet, user } from '../../../test/fixtures';
import { useAuth } from '@/store/auth';
import { usePets } from '@/store/pets';
import { RootLayout } from '../Root';
import { TabsLayout } from '../Tabs';

jest.mock('@/store/auth', () => {
  const { create } = jest.requireActual('zustand');
  const useAuth = create(() => ({ status: 'booting', user: null, bootstrap: jest.fn() }));
  return { useAuth };
});

const segments = jest.mocked(useSegments);

beforeEach(() => {
  useAuth.setState({ status: 'booting', user: null, bootstrap: jest.fn() } as never);
  segments.mockReturnValue([] as never);
});

describe('RootLayout', () => {
  it('segura a splash até carregar fontes e sessão', async () => {
    jest.mocked(useFonts).mockReturnValueOnce([false, null]);
    await renderWithTheme(<RootLayout />);
    expect(screen.toJSON()).toBeNull();
    expect(useAuth.getState().bootstrap).toHaveBeenCalled();
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
  });

  it('pronto: esconde a splash e monta as rotas e o toast', async () => {
    jest.mocked(SplashScreen.hideAsync).mockRejectedValueOnce(new Error('já escondida'));
    useAuth.setState({ status: 'signedIn', user } as never);
    segments.mockReturnValue(['(tabs)'] as never);
    await renderWithTheme(<RootLayout />);
    expect(SplashScreen.hideAsync).toHaveBeenCalled();
    expect(screen.getByText('screen:walk')).toBeOnTheScreen();
    expect(screen.getByText('screen:delete-account')).toBeOnTheScreen();
    expect(screen.getByText('screen:convite/[code]')).toBeOnTheScreen();
    expect(screen.getByText('screen:scan-invite')).toBeOnTheScreen();
    expect(screen.getByText('screen:live/[id]')).toBeOnTheScreen();
    expect(global.__router.replace).not.toHaveBeenCalled();
  });

  it('fontes prontas e sessão carregando: a abertura animada assume, sem rotas; depois sai', async () => {
    jest.useFakeTimers();
    await renderWithTheme(<RootLayout />);
    expect(SplashScreen.hideAsync).toHaveBeenCalled();
    expect(screen.getByTestId('splash')).toBeOnTheScreen();
    expect(screen.queryByText('screen:walk')).toBeNull();

    await act(() => useAuth.setState({ status: 'signedOut' } as never));
    expect(screen.getByText('screen:walk')).toBeOnTheScreen();
    await act(() => jest.advanceTimersByTime(2000));
    await act(() => jest.advanceTimersByTime(800));
    expect(screen.queryByTestId('splash')).toBeNull();
    jest.useRealTimers();
  });

  it('deslogado fora do login vai para o login e limpa os pets', async () => {
    usePets.setState({ pets: [makePet()], selectedId: 1, loaded: true });
    useAuth.setState({ status: 'signedOut' } as never);
    segments.mockReturnValue(['(tabs)'] as never);
    await renderWithTheme(<RootLayout />);
    expect(global.__router.replace).toHaveBeenCalledWith('/login');
    expect(usePets.getState().pets).toEqual([]);
  });

  it('deslogado já no login fica lá; logado no login vai para o início', async () => {
    useAuth.setState({ status: 'signedOut' } as never);
    segments.mockReturnValue(['(auth)'] as never);
    await renderWithTheme(<RootLayout />);
    expect(global.__router.replace).not.toHaveBeenCalled();

    await act(() => useAuth.setState({ status: 'signedIn', user } as never));
    await waitFor(() => expect(global.__router.replace).toHaveBeenCalledWith('/home'));
  });

  it('ignora falha ao segurar a splash na importação', () => {
    jest.mocked(SplashScreen.preventAutoHideAsync).mockRejectedValueOnce(new Error('x'));
    jest.isolateModules(() => require('../Root'));
    expect(SplashScreen.preventAutoHideAsync).toHaveBeenCalled();
  });
});

describe('TabsLayout', () => {
  it('registra as 4 abas e usa a tab bar customizada', async () => {
    await renderWithTheme(<TabsLayout />);
    for (const name of ['home', 'history', 'health', 'profile']) expect(screen.getByText(`tab:${name}`)).toBeOnTheScreen();
    expect(screen.getByLabelText('Começar passeio')).toBeOnTheScreen();
  });
});
