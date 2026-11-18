/**
 * As rotas do expo-router só reexportam as telas de src/screens.
 * Este teste garante que cada URL aponta para a tela certa.
 */
import { renderWithTheme, screen } from '../test/render';
import { useAuth } from '@/store/auth';
import * as Screens from './screens-index';

jest.mock('@/store/auth', () => {
  const { create } = jest.requireActual('zustand');
  return { useAuth: create(() => ({ status: 'signedOut' })) };
});

const routes: Array<[string, unknown]> = [
  ['_layout', Screens.RootLayout],
  ['(tabs)/_layout', Screens.TabsLayout],
  ['(tabs)/home', Screens.HomeScreen],
  ['(tabs)/history', Screens.HistoryScreen],
  ['(tabs)/health', Screens.HealthScreen],
  ['(tabs)/profile', Screens.ProfileScreen],
  ['(auth)/login', Screens.LoginScreen],
  ['(auth)/register', Screens.RegisterScreen],
  ['walk', Screens.WalkScreen],
  ['walk-summary', Screens.WalkSummaryScreen],
  ['walks/[id]', Screens.WalkDetailScreen],
  ['pet-form', Screens.PetFormScreen],
  ['health-form', Screens.HealthFormScreen],
  ['delete-account', Screens.DeleteAccountScreen],
  ['premium', Screens.PremiumScreen],
  ['walk-photo', Screens.WalkPhotoScreen],
  ['convite/[code]', Screens.InviteScreen],
  ['scan-invite', Screens.ScanInviteScreen],
];

describe('rotas', () => {
  it.each(routes)('app/%s exporta a tela certa', (route, screenComponent) => {
    expect(require(`../app/${route}`).default).toBe(screenComponent);
  });

  it('o layout de autenticação monta uma pilha sem cabeçalho', async () => {
    const AuthLayout = require('../app/(auth)/_layout').default;
    await renderWithTheme(<AuthLayout />);
    expect(screen.getByTestId('stack').props.accessibilityHint).toContain('"headerShown":false');
  });

  it('a rota raiz manda para o login ou para o início', async () => {
    const Index = require('../app/index').default;
    await renderWithTheme(<Index />);
    expect(screen.getByText('redirect:/login')).toBeOnTheScreen();
    useAuth.setState({ status: 'signedIn' });
    await renderWithTheme(<Index />);
    expect(screen.getByText('redirect:/home')).toBeOnTheScreen();
  });
});
