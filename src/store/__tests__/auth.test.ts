import * as SecureStore from 'expo-secure-store';
import * as apiModule from '@/services/api';
import { useAuth } from '../auth';

jest.mock('@/services/api', () => ({
  api: { me: jest.fn(), logout: jest.fn(() => Promise.resolve()) },
  setAuthToken: jest.fn(),
  setUnauthorizedHandler: jest.fn(),
}));

const { api, setAuthToken, setUnauthorizedHandler } = jest.mocked(apiModule);
const user = { id: 1, name: 'Gabriel', email: 'g@x.com' };

beforeEach(() => useAuth.setState({ user: null, status: 'booting' }));

describe('auth store', () => {
  it('sem token salvo fica deslogado', async () => {
    await useAuth.getState().bootstrap();
    expect(useAuth.getState().status).toBe('signedOut');
  });

  it('com token válido restaura a sessão', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('tok');
    api.me.mockResolvedValueOnce(user);
    await useAuth.getState().bootstrap();
    expect(setAuthToken).toHaveBeenCalledWith('tok');
    expect(useAuth.getState()).toMatchObject({ status: 'signedIn', user });
  });

  it('com token expirado limpa e desloga', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('velho');
    api.me.mockRejectedValueOnce(new Error('401'));
    await useAuth.getState().bootstrap();
    expect(setAuthToken).toHaveBeenLastCalledWith(null);
    expect(useAuth.getState().status).toBe('signedOut');
  });

  it('o 401 da API desloga só quem está logado', async () => {
    await useAuth.getState().bootstrap();
    const onUnauthorized = setUnauthorizedHandler.mock.calls[0][0];

    onUnauthorized(); // deslogado: nada acontece
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();

    useAuth.setState({ status: 'signedIn', user });
    onUnauthorized();
    await Promise.resolve();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
  });

  it('signIn guarda o token e signOut apaga, mesmo se o logout da API falhar', async () => {
    await useAuth.getState().signIn('novo', user);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('petmotion.token', 'novo');
    expect(useAuth.getState().status).toBe('signedIn');

    api.logout.mockRejectedValueOnce(new Error('offline'));
    await useAuth.getState().signOut();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('petmotion.token');
    expect(useAuth.getState()).toMatchObject({ status: 'signedOut', user: null });
  });
});
