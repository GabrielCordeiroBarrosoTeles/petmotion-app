import { act, fireEvent, renderWithTheme, screen, waitFor } from '../../../test/render';
import { member, user } from '../../../test/fixtures';
import * as apiModule from '@/services/api';
import { useAuth } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import { PremiumScreen } from '../Premium';

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  api: { startTrial: jest.fn() },
}));
const { api } = jest.mocked(apiModule);
// respostas "Once" não podem vazar de um teste para o outro
const resetApi = () => Object.values(api).forEach((fn) => (fn as jest.Mock).mockReset());
beforeEach(resetApi);

beforeEach(() => useAuth.setState({ status: 'signedIn', user }));

describe('Matilha', () => {
  it('apresenta benefícios (reais e em breve), planos e o teste grátis', async () => {
    await renderWithTheme(<PremiumScreen />);
    expect(screen.getByRole('header')).toHaveTextContent('Entre para a Matilha.');
    expect(screen.getByLabelText(/^Pets ilimitados\./)).toBeOnTheScreen();
    expect(screen.getByLabelText(/^Relatório para o veterinário, em breve/)).toBeOnTheScreen();
    expect(screen.getAllByText('Em breve')).toHaveLength(2);
    expect(screen.getByText('Economize 33%')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Começar 7 dias grátis' })).toBeOnTheScreen();
    expect(screen.getByText(/nenhuma cobrança é feita/)).toBeOnTheScreen();
  });

  it('troca o plano selecionado', async () => {
    await renderWithTheme(<PremiumScreen />);
    const yearly = screen.getByLabelText(/^Anual/);
    const monthly = screen.getByLabelText(/^Mensal/);
    expect(yearly.props.accessibilityState).toEqual({ checked: true });
    await fireEvent.press(monthly);
    expect(screen.getByLabelText(/^Mensal/).props.accessibilityState).toEqual({ checked: true });
    expect(screen.getByLabelText(/^Anual/).props.accessibilityState).toEqual({ checked: false });
  });

  it('ativa o teste grátis, atualiza o usuário e dá as boas-vindas', async () => {
    api.startTrial.mockResolvedValueOnce(member);
    await renderWithTheme(<PremiumScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Começar 7 dias grátis' }));
    expect(await screen.findByText('Bem-vindo à Matilha!')).toBeOnTheScreen();
    expect(screen.getByText(/Seu acesso vai até 17 de dezembro de 2026\./)).toBeOnTheScreen();
    expect(useAuth.getState().user?.is_premium).toBe(true);
    await fireEvent.press(screen.getByRole('button', { name: 'Bora passear' }));
    expect(global.__router.back).toHaveBeenCalled();
  });

  it('erro da API vira aviso e continua na oferta', async () => {
    api.startTrial.mockRejectedValueOnce(new Error('x'));
    await renderWithTheme(<PremiumScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Começar 7 dias grátis' }));
    await waitFor(() => expect(useToastStore.getState().current?.type).toBe('danger'));
    expect(screen.getByRole('button', { name: 'Começar 7 dias grátis' })).toBeOnTheScreen();
  });

  it('teste já usado: botão "Assinar" explica que pagamento chega em breve', async () => {
    useAuth.setState({ user: { ...user, trial_available: false } });
    await renderWithTheme(<PremiumScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Assinar' }));
    expect(useToastStore.getState().current?.message).toMatch(/pagamentos chegam em breve/i);
    expect(api.startTrial).not.toHaveBeenCalled();
  });

  it('quem já é membro abre direto nas boas-vindas; sem data não mostra o prazo', async () => {
    useAuth.setState({ user: { ...member, premium_until: null } });
    await renderWithTheme(<PremiumScreen />);
    expect(screen.getByText('Bem-vindo à Matilha!')).toBeOnTheScreen();
    expect(screen.queryByText(/Seu acesso vai até/)).toBeNull();
  });

  it('fecha pelo X; sem usuário mostra a oferta', async () => {
    useAuth.setState({ user: null });
    await renderWithTheme(<PremiumScreen />);
    await fireEvent.press(screen.getByLabelText('Fechar'));
    expect(global.__router.back).toHaveBeenCalled();
    await act(async () => undefined);
  });
});
