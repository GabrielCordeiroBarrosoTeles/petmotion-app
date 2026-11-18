import { fireEvent, renderWithTheme, screen, waitFor } from '../../../test/render';
import { user } from '../../../test/fixtures';
import * as apiModule from '@/services/api';
import { useAuth } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import { DeleteAccountScreen } from '../DeleteAccount';
import { LoginScreen } from '../Login';
import { RegisterScreen } from '../Register';

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  api: { login: jest.fn(), register: jest.fn(), deleteAccount: jest.fn(), logout: jest.fn(() => Promise.resolve()) },
}));
const { api } = jest.mocked(apiModule);
// respostas "Once" não podem vazar de um teste para o outro
const resetApi = () => Object.values(api).forEach((fn) => (fn as jest.Mock).mockReset());
beforeEach(resetApi);
const apiError = () => Object.assign(new Error('x'), { isAxiosError: true, response: { data: { message: 'E-mail ou senha incorretos.' } } });

beforeEach(() => useAuth.setState({ status: 'signedOut', user: null }));

describe('Login', () => {
  it('valida os campos e limpa o erro ao digitar', async () => {
    await renderWithTheme(<LoginScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
    expect(screen.getByText('Digite um e-mail válido.')).toBeOnTheScreen();
    expect(screen.getByText('A senha tem pelo menos 6 caracteres.')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'a');
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'b');
    expect(screen.queryByText('Digite um e-mail válido.')).toBeNull();
    expect(screen.queryByText('A senha tem pelo menos 6 caracteres.')).toBeNull();
    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'ab'); // sem erro para limpar
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'bc');
    expect(api.login).not.toHaveBeenCalled();
  });

  it('entra com a conta demo, normalizando o e-mail', async () => {
    api.login.mockResolvedValueOnce({ token: 'tok', user });
    await renderWithTheme(<LoginScreen />);
    expect(screen.queryByText(/Toque para usar a conta demo/)).toBeNull(); // o atalho fica escondido na bola
    await fireEvent.press(screen.getByLabelText('Preencher com a conta de demonstração'));
    await fireEvent(screen.getByLabelText('Senha'), 'submitEditing');
    await waitFor(() => expect(useAuth.getState().status).toBe('signedIn'));
    expect(api.login).toHaveBeenCalledWith('gabriel@petmotion.app', 'petmotion');
  });

  it('tocar no nome da marca preenche a conta do passeador', async () => {
    api.login.mockResolvedValueOnce({ token: 'tok', user });
    await renderWithTheme(<LoginScreen />);
    await fireEvent.press(screen.getByLabelText('Preencher com a conta do passeador'));
    await fireEvent(screen.getByLabelText('Senha'), 'submitEditing');
    await waitFor(() => expect(api.login).toHaveBeenCalledWith('joao@passeador.app', 'petmotion'));
  });

  it('mostra o erro da API e vai para o cadastro', async () => {
    api.login.mockRejectedValueOnce(apiError());
    await renderWithTheme(<LoginScreen />);
    await fireEvent.changeText(screen.getByLabelText('E-mail'), ' Ana@X.com ');
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'errada1');
    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
    await waitFor(() => expect(useToastStore.getState().current?.message).toBe('E-mail ou senha incorretos.'));
    expect(api.login).toHaveBeenCalledWith('ana@x.com', 'errada1');

    await fireEvent.press(screen.getByLabelText('Criar conta'));
    expect(global.__router.push).toHaveBeenCalledWith('/register');
  });
});

describe('Cadastro', () => {
  it('valida e limpa cada campo', async () => {
    await renderWithTheme(<RegisterScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }));
    expect(screen.getByText('Como podemos te chamar?')).toBeOnTheScreen();
    for (const label of ['Seu nome', 'E-mail', 'Senha']) {
      await fireEvent.changeText(screen.getByLabelText(label), 'x');
      await fireEvent.changeText(screen.getByLabelText(label), 'xy');
    }
    expect(screen.queryByText('Como podemos te chamar?')).toBeNull();
    expect(screen.queryByText('Use pelo menos 6 caracteres.')).toBeNull();
  });

  it('cria a conta, dá boas-vindas e abre o cadastro do pet', async () => {
    api.register.mockResolvedValueOnce({ token: 'tok', user });
    await renderWithTheme(<RegisterScreen />);
    await fireEvent.changeText(screen.getByLabelText('Seu nome'), ' Ana Souza ');
    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'ANA@x.com');
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'segredo1');
    await fireEvent(screen.getByLabelText('Senha'), 'submitEditing');
    await waitFor(() => expect(global.__router.push).toHaveBeenCalledWith('/pet-form'));
    expect(api.register).toHaveBeenCalledWith('Ana Souza', 'ana@x.com', 'segredo1');
    expect(useToastStore.getState().current?.message).toBe('Bem-vindo, Ana! Agora cadastre seu pet.');
  });

  it('mostra erro da API e volta para o login', async () => {
    api.register.mockRejectedValueOnce(apiError());
    await renderWithTheme(<RegisterScreen />);
    await fireEvent.changeText(screen.getByLabelText('Seu nome'), 'Ana');
    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'ana@x.com');
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'segredo1');
    await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }));
    await waitFor(() => expect(useToastStore.getState().current?.type).toBe('danger'));
    await fireEvent.press(screen.getByLabelText('Voltar para entrar'));
    expect(global.__router.back).toHaveBeenCalled();
  });
});

describe('Excluir conta', () => {
  it('exige a senha', async () => {
    await renderWithTheme(<DeleteAccountScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir minha conta' }));
    expect(screen.getByText('Digite sua senha para confirmar.')).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText('Sua senha'), 'x');
    expect(screen.queryByText('Digite sua senha para confirmar.')).toBeNull();
  });

  it('exclui, desloga e agradece', async () => {
    useAuth.setState({ status: 'signedIn', user });
    api.logout.mockResolvedValue({} as never);
    api.deleteAccount.mockResolvedValueOnce({} as never);
    await renderWithTheme(<DeleteAccountScreen />);
    await fireEvent.changeText(screen.getByLabelText('Sua senha'), 'segredo1');
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir minha conta' }));
    await waitFor(() => expect(useAuth.getState().status).toBe('signedOut'));
    expect(api.deleteAccount).toHaveBeenCalledWith('segredo1');
    expect(useToastStore.getState().current?.message).toMatch(/excluída/);
  });

  it('mostra a senha incorreta e permite cancelar', async () => {
    api.deleteAccount.mockRejectedValueOnce(apiError());
    await renderWithTheme(<DeleteAccountScreen />);
    await fireEvent.changeText(screen.getByLabelText('Sua senha'), 'errada');
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir minha conta' }));
    expect(await screen.findByText('E-mail ou senha incorretos.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    await fireEvent.press(screen.getByLabelText('Voltar'));
    expect(global.__router.back).toHaveBeenCalledTimes(2);
  });
});
