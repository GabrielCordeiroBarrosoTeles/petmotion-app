import * as Sharing from 'expo-sharing';
import { useLocalSearchParams } from 'expo-router';
import { act, answerConfirm, fireEvent, pullToRefresh, renderWithTheme, screen, scrollToEnd, waitFor } from '../../../test/render';
import { useConfirmStore } from '@/store/confirm';
import { makePet, makeStats, makeWalk, user } from '../../../test/fixtures';
import * as apiModule from '@/services/api';
import { useAuth } from '@/store/auth';
import { usePets } from '@/store/pets';
import { useToastStore } from '@/store/toast';
import { HistoryScreen } from '../History';
import { WalkDetailScreen } from '../WalkDetail';
import { WalkSummaryScreen } from '../WalkSummary';

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  api: { walk: jest.fn(), walks: jest.fn(), stats: jest.fn(), deleteWalk: jest.fn() },
}));
const { api } = jest.mocked(apiModule);
// respostas "Once" não podem vazar de um teste para o outro
const resetApi = () => Object.values(api).forEach((fn) => (fn as jest.Mock).mockReset());
beforeEach(resetApi);
const params = jest.mocked(useLocalSearchParams);
const page = (items: ReturnType<typeof makeWalk>[], current = 1, last = 1, total = items.length) =>
  ({ data: items, current_page: current, last_page: last, total }) as never;

beforeEach(() => {
  jest.useFakeTimers({ advanceTimers: true }).setSystemTime(new Date('2026-11-17T20:00:00'));
  usePets.setState({ pets: [makePet()], selectedId: 1, loaded: true });
});
afterEach(() => jest.useRealTimers());

describe('Resumo do passeio', () => {
  it('passeio em grupo: título com todos os nomes e avatares sobrepostos', async () => {
    params.mockReturnValue({ id: '10' });
    api.walk.mockResolvedValue(
      makeWalk({
        companions: [
          { id: 2, name: 'Mel', species: 'cat', photo_url: null },
          { id: 3, name: 'Bidu', species: 'dog', photo_url: null },
        ],
      }),
    );
    api.stats.mockResolvedValue(makeStats());
    await renderWithTheme(<WalkSummaryScreen />);
    expect(await screen.findByText('Passeio de Thor, Mel e Bidu')).toBeOnTheScreen();
    expect(screen.getByText(/Thor, Mel e Bidu andaram 3,42 km e mantiveram a sequência de 6 dias\./)).toBeOnTheScreen();
    expect(screen.getAllByLabelText(/^Foto de /)).toHaveLength(3);
    await fireEvent.press(screen.getByRole('button', { name: 'Compartilhar card' }));
    await waitFor(() => expect(Sharing.shareAsync).toHaveBeenCalled());
  });

  it('comemora, mostra o card e as conquistas novas', async () => {
    params.mockReturnValue({ id: '10', before: 'first_walk' });
    api.walk.mockResolvedValue(makeWalk());
    api.stats.mockResolvedValue(
      makeStats({
        achievements: [
          { code: 'first_walk', title: 'Primeiro passo', description: '', icon: 'footprints', progress: 1, unlocked: true },
          { code: 'distance_3k', title: 'Explorador', description: '', icon: 'map', progress: 1, unlocked: true },
        ],
      }),
    );
    await renderWithTheme(<WalkSummaryScreen />);
    expect(await screen.findByText('Que passeio!')).toBeOnTheScreen();
    expect(screen.getByText(/Thor andou 3,42 km e manteve a sequência de 6 dias\./)).toBeOnTheScreen();
    expect(screen.getByLabelText(/Nova conquista: Explorador/)).toBeOnTheScreen();
    expect(screen.queryByLabelText(/Nova conquista: Primeiro passo/)).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Compartilhar card' }));
    await waitFor(() => expect(Sharing.shareAsync).toHaveBeenCalled());
    await fireEvent.press(screen.getByRole('button', { name: 'Criar foto do passeio' }));
    expect(global.__router.push).toHaveBeenCalledWith({ pathname: '/walk-photo', params: { id: '10' } });
    await fireEvent.press(screen.getByRole('button', { name: 'Concluir' }));
    expect(global.__router.replace).toHaveBeenCalledWith('/home');
  });

  it('meta batida, sem sequência, sem lista "antes" e com o pet da store', async () => {
    params.mockReturnValue({ id: '10' });
    api.walk.mockResolvedValue(makeWalk({ pet: undefined }));
    api.stats.mockResolvedValue(makeStats({ streak_days: 1, today: { ...makeStats().today, goal_progress: 1 } }));
    await renderWithTheme(<WalkSummaryScreen />);
    expect(await screen.findByText(/Meta do dia/)).toBeOnTheScreen();
    expect(screen.getByText(/Thor andou 3,42 km\./)).toBeOnTheScreen();
    expect(screen.queryByLabelText(/Nova conquista/)).toBeNull();
  });

  it('erro ao carregar mostra aviso e fica no skeleton', async () => {
    params.mockReturnValue({ id: '10' });
    api.walk.mockRejectedValue(new Error('x'));
    await renderWithTheme(<WalkSummaryScreen />);
    await waitFor(() => expect(useToastStore.getState().current?.type).toBe('danger'));
    expect(screen.getByLabelText('Carregando resumo')).toBeOnTheScreen();
  });
});

describe('Histórico: quem passeou', () => {
  it('mostra "com Carlos" só quando quem passeou não sou eu', async () => {
    useAuth.setState({ status: 'signedIn', user });
    api.walks.mockResolvedValue(
      page([
        makeWalk({ id: 10, walker: { id: 9, name: 'Carlos' } }),
        makeWalk({ id: 11, walker: { id: user.id, name: 'Gabriel' } }),
        makeWalk({ id: 12 }),
      ]),
    );
    await renderWithTheme(<HistoryScreen />);
    expect(await screen.findByText('com Carlos')).toBeOnTheScreen();
    expect(screen.queryByText('com Gabriel')).toBeNull();
  });
});

describe('Histórico', () => {
  it('lista os passeios, resume os totais e abre o detalhe', async () => {
    api.walks.mockResolvedValue(page([makeWalk(), makeWalk({ id: 11, events: [], started_at: '2026-11-10T07:00:00' })]));
    await renderWithTheme(<HistoryScreen />);
    expect(await screen.findByText('Histórico do Thor')).toBeOnTheScreen();
    expect(screen.getByText(/no total/)).toBeOnTheScreen();
    expect(screen.getAllByText('3,42 km')).toHaveLength(2);

    await fireEvent.press(screen.getByLabelText(/Passeio de Hoje/));
    expect(global.__router.push).toHaveBeenCalledWith({ pathname: '/walks/[id]', params: { id: '10' } });
  });

  it('carrega mais ao chegar no fim e ignora quando já está na última página', async () => {
    api.walks.mockResolvedValueOnce(page([makeWalk()], 1, 2, 2));
    await renderWithTheme(<HistoryScreen />);
    expect(await screen.findByText(/recentes/)).toBeOnTheScreen();

    let resolveNext: (v: unknown) => void = () => undefined;
    api.walks.mockReturnValueOnce(new Promise((r) => (resolveNext = r)) as never);
    await scrollToEnd({ wait: false }); // fica esperando a resposta da página 2
    expect(screen.getByLabelText('Carregando mais passeios')).toBeOnTheScreen();
    await scrollToEnd({ wait: false }); // já carregando: ignora
    await act(async () => resolveNext(page([makeWalk({ id: 12 })], 2, 2, 2)));
    expect(api.walks).toHaveBeenLastCalledWith(1, 2);
    expect(await screen.findByText(/no total/)).toBeOnTheScreen();

    await scrollToEnd(); // última página
    expect(api.walks).toHaveBeenCalledTimes(2);
  });

  it('erro ao carregar mais vira toast; puxar para atualizar recarrega', async () => {
    api.walks.mockResolvedValueOnce(page([makeWalk()], 1, 3, 30));
    await renderWithTheme(<HistoryScreen />);
    await screen.findByText(/recentes/);
    api.walks.mockRejectedValueOnce(new Error('offline'));
    await scrollToEnd();
    await waitFor(() => expect(useToastStore.getState().current?.type).toBe('danger'));

    api.walks.mockResolvedValueOnce(page([]));
    await pullToRefresh();
    expect(await screen.findByText('Nenhum passeio ainda')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Começar passeio' }));
    expect(global.__router.push).toHaveBeenCalledWith('/walk');
  });

  it('sem pet convida a cadastrar', async () => {
    usePets.setState({ pets: [], selectedId: null });
    await renderWithTheme(<HistoryScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar pet' }));
    expect(global.__router.push).toHaveBeenCalledWith('/pet-form');
    expect(screen.getByText('Cadastre seu pet para começar.')).toBeOnTheScreen();
  });
});

describe('Detalhe do passeio', () => {
  beforeEach(() => params.mockReturnValue({ id: '10' }));

  it('mostra mapa, números, card e compartilha', async () => {
    api.walk.mockResolvedValue(makeWalk({ temperature_c: null }));
    await renderWithTheme(<WalkDetailScreen />);
    expect(await screen.findByText('3,42 km com Thor')).toBeOnTheScreen();
    expect(screen.getByText('--')).toBeOnTheScreen(); // sem temperatura
    await fireEvent.press(screen.getByRole('button', { name: 'Compartilhar card' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Criar foto do passeio' }));
    expect(global.__router.push).toHaveBeenCalledWith({ pathname: '/walk-photo', params: { id: '10' } });
    await waitFor(() => expect(Sharing.shareAsync).toHaveBeenCalled());
    await fireEvent.press(screen.getByLabelText('Voltar'));
    expect(global.__router.back).toHaveBeenCalled();
  });

  it('rolou para baixo do mapa: o fundo da barra de status aparece; voltou ao topo, some', async () => {
    api.walk.mockResolvedValue(makeWalk());
    await renderWithTheme(<WalkDetailScreen />);
    await screen.findByText('3,42 km com Thor');
    expect(screen.queryByTestId('status-bar-scrim')).toBeNull(); // o mapa passa por baixo do relógio
    const scroll = screen.getByTestId('walk-detail-scroll');
    await fireEvent.scroll(scroll, { nativeEvent: { contentOffset: { y: 300 } } });
    expect(screen.getByTestId('status-bar-scrim')).toBeOnTheScreen();
    await fireEvent.scroll(scroll, { nativeEvent: { contentOffset: { y: 0 } } });
    expect(screen.queryByTestId('status-bar-scrim')).toBeNull();
  });

  it('exclui depois de confirmar', async () => {
    api.walk.mockResolvedValue(makeWalk());
    api.deleteWalk.mockResolvedValueOnce({} as never);
    await renderWithTheme(<WalkDetailScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Excluir passeio' }));
    expect(useConfirmStore.getState().current?.title).toBe('Excluir passeio?');
    await answerConfirm(false);
    expect(api.deleteWalk).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir passeio' }));
    await answerConfirm(true);
    expect(api.deleteWalk).toHaveBeenCalledWith(10);
    expect(global.__router.back).toHaveBeenCalled();
    expect(useToastStore.getState().current?.message).toBe('Passeio excluído.');
  });

  it('erro ao excluir ou ao carregar mostra aviso; usa o pet da store se a API não mandar', async () => {
    api.walk.mockResolvedValue(makeWalk({ pet: undefined }));
    api.deleteWalk.mockRejectedValueOnce(new Error('x'));
    await renderWithTheme(<WalkDetailScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Excluir passeio' }));
    await answerConfirm(true);
    expect(useToastStore.getState().current?.type).toBe('danger');

    api.walk.mockRejectedValueOnce(new Error('404'));
    await renderWithTheme(<WalkDetailScreen />);
    await waitFor(() => expect(screen.getAllByLabelText('Carregando passeio').length).toBeGreaterThan(0));
  });
});
