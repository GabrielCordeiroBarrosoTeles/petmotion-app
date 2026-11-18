import { fireEvent, pullToRefresh, renderWithTheme, screen, waitFor } from '../../../test/render';
import { makeHealth, makePet, makeStats, member, user, weather } from '../../../test/fixtures';
import * as apiModule from '@/services/api';
import { useAuth } from '@/store/auth';
import { useLive } from '@/store/live';
import { usePets } from '@/store/pets';
import { useToastStore } from '@/store/toast';
import { HomeScreen } from '../Home';

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  api: { pets: jest.fn(), stats: jest.fn(), weather: jest.fn() },
}));
const { api } = jest.mocked(apiModule);
// respostas "Once" não podem vazar de um teste para o outro
const resetApi = () => Object.values(api).forEach((fn) => (fn as jest.Mock).mockReset());
beforeEach(resetApi);

beforeEach(() => {
  jest.useFakeTimers({ advanceTimers: true }).setSystemTime(new Date('2026-11-17T15:00:00'));
  useAuth.setState({ status: 'signedIn', user });
  usePets.getState().reset();
  api.weather.mockResolvedValue(weather);
});
afterEach(() => jest.useRealTimers());

describe('Início: passeio ao vivo', () => {
  const live = (status: 'running' | 'paused' | 'finished') => ({
    session: 'S1', status, walker: { id: 9, name: 'João' }, pet_id: 1, pet_names: ['Thor'], started_at: '2026-11-17T14:00:00Z',
    elapsed_ms: 0, at: '2026-11-17T14:00:00Z', distance: 0, steps: 0, points: [], counts: { pee: 0, poop: 0, water: 0 },
  });
  afterEach(() => useLive.getState().reset());

  it('pet saiu com o passeador: mostra o aviso e abre o ao vivo', async () => {
    useLive.getState().set(1, live('paused'));
    api.pets.mockResolvedValue([makePet(), makePet({ id: 2, name: 'Mel' })]);
    api.stats.mockResolvedValue(makeStats());
    await renderWithTheme(<HomeScreen />);
    expect(await screen.findByText('Thor está passeando com João')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Thor está passeando com João. Ver ao vivo' }));
    expect(global.__router.push).toHaveBeenCalledWith('/live/1');

    // outro pet selecionado: o aviso é só do pet que está passeando
    await fireEvent.press(screen.getByLabelText('Selecionar Mel'));
    await waitFor(() => expect(screen.queryByText('Ver ao vivo')).toBeNull());
  });

  it('passeio já concluído não mostra o aviso', async () => {
    useLive.getState().set(1, live('finished'));
    api.pets.mockResolvedValue([makePet()]);
    api.stats.mockResolvedValue(makeStats());
    await renderWithTheme(<HomeScreen />);
    await screen.findByText('Sua semana');
    expect(screen.queryByText('Ver ao vivo')).toBeNull();
  });
});

describe('Início: pet de passeio', () => {
  it('mostra de quem é o pet', async () => {
    api.pets.mockResolvedValue([makePet({ id: 7, name: 'Bidu', role: 'walker', owner_name: 'Ana' })]);
    api.stats.mockResolvedValue(makeStats());
    await renderWithTheme(<HomeScreen />);
    expect(await screen.findByText('Pet de Ana')).toBeOnTheScreen();
    expect(screen.getByText('Passeio')).toBeOnTheScreen();
  });
});

describe('Início', () => {
  it('mostra anel, sequência, clima, semana, cuidados e conquistas', async () => {
    api.pets.mockResolvedValue([makePet(), makePet({ id: 2, name: 'Mel' })]);
    api.stats.mockResolvedValue(makeStats());
    await renderWithTheme(<HomeScreen />);

    expect(await screen.findByText('Faltam 8 min pro Thor')).toBeOnTheScreen();
    expect(screen.getByText('Gabriel')).toBeOnTheScreen();
    expect(screen.getByLabelText('Sequência de 6 dias passeando')).toBeOnTheScreen();
    expect(await screen.findByText('Chão morno, atenção')).toBeOnTheScreen();
    expect(screen.getByText('Sua semana')).toBeOnTheScreen();
    expect(screen.getByText('V10')).toBeOnTheScreen();
    expect(screen.getByText('1 de 2')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Passear' }));
    expect(global.__router.push).toHaveBeenCalledWith('/walk');
    await fireEvent.press(screen.getByLabelText('Adicionar pet'));
    expect(global.__router.push).toHaveBeenCalledWith('/pet-form');
  });

  it('conquista: desbloqueada explica, bloqueada mostra quanto falta', async () => {
    api.pets.mockResolvedValue([makePet()]);
    api.stats.mockResolvedValue(makeStats());
    await renderWithTheme(<HomeScreen />);
    await fireEvent.press(await screen.findByLabelText(/Primeiro passo/));
    expect(useToastStore.getState().current).toMatchObject({ type: 'success', message: 'Primeiro passo: Complete o primeiro passeio.' });
    await fireEvent.press(screen.getByLabelText(/Maratonista/));
    expect(useToastStore.getState().current).toMatchObject({ type: 'warning', message: '25 km somados — faltam 60%.' });
  });

  it('meta batida, sequência de 1 dia, cuidado atrasado e sem clima', async () => {
    api.weather.mockRejectedValue(new Error('x'));
    api.pets.mockResolvedValue([makePet()]);
    api.stats.mockResolvedValue(
      makeStats({
        streak_days: 1,
        today: { minutes: 45, distance_meters: 3000, steps: 4000, walks: 2, goal_minutes: 40, goal_progress: 1 },
        upcoming_health: [makeHealth({ next_date: '2026-11-15' }), makeHealth({ id: 6, next_date: '2026-11-16' })],
      }),
    );
    await renderWithTheme(<HomeScreen />);
    expect(await screen.findByText('Thor bateu a meta hoje!')).toBeOnTheScreen();
    expect(screen.getByText('1 dia')).toBeOnTheScreen();
    expect(screen.getByText('Atrasado há 2 dias')).toBeOnTheScreen();
    expect(screen.getByText('Atrasado há 1 dia')).toBeOnTheScreen();
  });

  it('sem sequência, sem cuidados e usando a meta do pet enquanto carrega', async () => {
    api.pets.mockResolvedValue([makePet()]);
    api.stats.mockResolvedValue(makeStats({ streak_days: 0, upcoming_health: [] }));
    await renderWithTheme(<HomeScreen />);
    await screen.findByText('Sua semana');
    expect(screen.queryByLabelText(/Sequência/)).toBeNull();
    expect(screen.queryByText('Próximos cuidados')).toBeNull();
  });

  it('sem pets convida a cadastrar', async () => {
    api.pets.mockResolvedValue([]);
    await renderWithTheme(<HomeScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Cadastrar meu pet' }));
    expect(global.__router.push).toHaveBeenCalledWith('/pet-form');
    expect(api.stats).not.toHaveBeenCalled();
  });

  it('erro ao carregar os pets vira toast; puxar para atualizar recarrega', async () => {
    api.pets.mockRejectedValueOnce(new Error('offline'));
    await renderWithTheme(<HomeScreen />);
    await waitFor(() => expect(useToastStore.getState().current?.type).toBe('danger'));

    api.pets.mockResolvedValue([makePet()]);
    api.stats.mockResolvedValue(makeStats());
    await pullToRefresh();
    await waitFor(() => expect(api.pets).toHaveBeenCalledTimes(2));

    // falha ao atualizar não derruba a tela
    api.pets.mockRejectedValueOnce(new Error('offline de novo'));
    await pullToRefresh();
  });

  it('membro da Matilha ganha o selo ao lado do nome', async () => {
    useAuth.setState({ user: member });
    api.pets.mockResolvedValue([]);
    await renderWithTheme(<HomeScreen />);
    expect(await screen.findByLabelText('Membro da Matilha')).toBeOnTheScreen();
  });

  it('sem usuário não quebra a saudação', async () => {
    useAuth.setState({ user: null });
    api.pets.mockResolvedValue([]);
    await renderWithTheme(<HomeScreen />);
    await screen.findByText('Quem vai passear?');
  });
});

