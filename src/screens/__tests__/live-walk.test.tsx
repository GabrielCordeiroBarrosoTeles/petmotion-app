import { useLocalSearchParams } from 'expo-router';
import { AppState, type AppStateStatus } from 'react-native';
import { act, fireEvent, renderWithTheme, screen, waitFor } from '../../../test/render';
import { makePet } from '../../../test/fixtures';
import * as apiModule from '@/services/api';
import type { LiveWalk } from '@/services/types';
import { useLive } from '@/store/live';
import { usePets } from '@/store/pets';
import { useToastStore } from '@/store/toast';
import { LiveWalkScreen } from '../LiveWalk';

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  api: { live: jest.fn() },
}));
const { api } = jest.mocked(apiModule);

const liveState = (overrides: Partial<LiveWalk> = {}): LiveWalk => ({
  session: 'S1', status: 'running', walker: { id: 9, name: 'João' }, pet_id: 1, pet_names: ['Thor'], started_at: '2026-11-17T18:00:00Z',
  elapsed_ms: 60000, at: '2026-11-17T18:01:00Z', distance: 1240, steps: 1680, points: [[0, 0], [0, 1]],
  counts: { pee: 2, poop: 1, water: 0 }, ...overrides,
});

const routeData = () => (screen.getByTestId('route-source').props.data as { geometry: { coordinates: unknown[] } }).geometry.coordinates;

beforeEach(() => {
  api.live.mockReset();
  jest.useFakeTimers({ advanceTimers: true }).setSystemTime(new Date('2026-11-17T18:01:10Z'));
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: '1' });
  usePets.setState({ pets: [makePet()], selectedId: 1, loaded: true });
  useLive.getState().reset();
});
afterEach(() => jest.useRealTimers());

describe('Passeio ao vivo (pai/mãe de pet)', () => {
  it('carregando: skeleton; depois mostra tempo andando sozinho, km, passos, marcações e com quem', async () => {
    let answer!: (v: LiveWalk) => void;
    api.live.mockReturnValue(new Promise((resolve) => (answer = resolve)));
    await renderWithTheme(<LiveWalkScreen />);
    expect(screen.getByLabelText('Carregando passeio ao vivo')).toBeOnTheScreen();
    await act(() => answer(liveState()));

    expect(await screen.findByText('01:10')).toBeOnTheScreen(); // 60 s do servidor + 10 s desde então
    expect(screen.getByText('1,24')).toBeOnTheScreen();
    expect(screen.getByText('1.680')).toBeOnTheScreen();
    expect(screen.getByLabelText('2 xixi')).toBeOnTheScreen();
    expect(screen.getByLabelText('1 cocô')).toBeOnTheScreen();
    expect(screen.getByLabelText('0 água')).toBeOnTheScreen();
    expect(screen.getByText(/Thor com João/)).toBeOnTheScreen();
    expect(routeData()).toHaveLength(2);

    await act(() => jest.advanceTimersByTime(3000));
    expect(screen.getByText('01:13')).toBeOnTheScreen();

    await fireEvent.press(screen.getByLabelText('Fechar'));
    expect(global.__router.back).toHaveBeenCalled();
  });

  it('evento novo acrescenta pontos; pausado para o relógio', async () => {
    api.live.mockResolvedValue(liveState());
    await renderWithTheme(<LiveWalkScreen />);
    await screen.findByText('01:10');

    await act(() => useLive.getState().apply(1, liveState({ status: 'paused', elapsed_ms: 75000, at: '2026-11-17T18:01:10Z', new_points: [[0, 2]] })));
    expect(routeData()).toHaveLength(3);
    expect(screen.getByText('01:15')).toBeOnTheScreen();
    expect(screen.getByText(/Pausado · Thor com João/)).toBeOnTheScreen();
    await act(() => jest.advanceTimersByTime(5000));
    expect(screen.getByText('01:15')).toBeOnTheScreen();
  });

  it('evento cortado (rota longa demais pro socket): busca a rota completa', async () => {
    api.live.mockResolvedValueOnce(liveState());
    await renderWithTheme(<LiveWalkScreen />);
    await screen.findByText('01:10');

    const full = liveState({ points: [[0, 0], [0, 1], [0, 2], [0, 3]] });
    api.live.mockResolvedValueOnce(full);
    await act(() => useLive.getState().apply(1, liveState({ new_points: [[0, 3]], truncated: true })));
    await waitFor(() => expect(api.live).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(routeData()).toHaveLength(4));
  });

  it('sem atualização por mais de 30 s: o relógio para e avisa há quanto tempo', async () => {
    api.live.mockResolvedValue(liveState());
    await renderWithTheme(<LiveWalkScreen />);
    await screen.findByText('01:10');
    expect(screen.queryByText(/Sem atualização/)).toBeNull();

    await act(() => jest.advanceTimersByTime(20000)); // 30 s desde o último evento: ainda em dia
    expect(screen.getByText('01:30')).toBeOnTheScreen();
    expect(screen.queryByText(/Sem atualização/)).toBeNull();

    await act(() => jest.advanceTimersByTime(5000));
    expect(screen.getByText('01:30')).toBeOnTheScreen(); // não passa de at + 30 s
    expect(screen.getByText('Sem atualização há instantes')).toBeOnTheScreen();

    await act(() => jest.advanceTimersByTime(60000));
    expect(screen.getByText('01:30')).toBeOnTheScreen();
    expect(screen.getByText('Sem atualização há 1 min')).toBeOnTheScreen();

    // chegou notícia: o aviso some e o relógio volta a andar
    await act(() => useLive.getState().apply(1, liveState({ elapsed_ms: 150000, at: '2026-11-17T18:02:35Z' })));
    expect(screen.getByText('02:30')).toBeOnTheScreen();
    expect(screen.queryByText(/Sem atualização/)).toBeNull();
  });

  it('dois eventos cortados seguidos buscam a rota completa duas vezes', async () => {
    api.live.mockResolvedValueOnce(liveState());
    await renderWithTheme(<LiveWalkScreen />);
    await screen.findByText('01:10');

    // o GET volta mais velho que o evento (o evento ganha), então a flag `truncated` continua ligada
    api.live.mockResolvedValue(liveState({ at: '2026-11-17T18:00:30Z' }));
    await act(() => useLive.getState().apply(1, liveState({ at: '2026-11-17T18:01:05Z', new_points: [[0, 3]], truncated: true })));
    await waitFor(() => expect(api.live).toHaveBeenCalledTimes(2));
    await act(() => useLive.getState().apply(1, liveState({ at: '2026-11-17T18:01:08Z', new_points: [[0, 4]], truncated: true })));
    await waitFor(() => expect(api.live).toHaveBeenCalledTimes(3));
  });

  it('nenhum passeio agora', async () => {
    useLive.getState().set(1, liveState()); // estado velho some quando o servidor diz que não há passeio
    api.live.mockResolvedValue(null);
    await renderWithTheme(<LiveWalkScreen />);
    expect(await screen.findByText('Nenhum passeio agora')).toBeOnTheScreen();
    expect(screen.getByText('Quando alguém sair para passear com Thor, você acompanha por aqui.')).toBeOnTheScreen();
    expect(useLive.getState().byPet[1]).toBeUndefined();
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(global.__router.back).toHaveBeenCalled();
  });

  it('pet que não está na lista e erro de rede: avisa e mostra que não há passeio', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: '8' });
    api.live.mockRejectedValue(new Error('x'));
    await renderWithTheme(<LiveWalkScreen />);
    expect(await screen.findByText('Quando alguém sair para passear com seu pet, você acompanha por aqui.')).toBeOnTheScreen();
    expect(useToastStore.getState().current?.type).toBe('danger');
  });

  it('passeio concluído: mostra o resumo e abre o registro salvo', async () => {
    api.live.mockResolvedValue(liveState({ status: 'finished', walk_id: 80, elapsed_ms: 42 * 60000 }));
    await renderWithTheme(<LiveWalkScreen />);
    expect(await screen.findByText('Passeio concluído')).toBeOnTheScreen();
    expect(screen.getByText(/Thor com João · 42:00/)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Ver passeio' }));
    expect(global.__router.replace).toHaveBeenCalledWith('/walks/80');
  });

  it('passeio descartado', async () => {
    api.live.mockResolvedValue(liveState());
    await renderWithTheme(<LiveWalkScreen />);
    await screen.findByText('01:10');
    await act(() => useLive.getState().apply(1, { session: 'S1', pet_id: 1, status: 'cancelled' } as LiveWalk));
    expect(screen.getByText('O passeio foi descartado')).toBeOnTheScreen();
  });

  it('voltou para o app: busca a rota completa de novo (pontos perdidos com o socket fora)', async () => {
    const listeners: Array<(st: AppStateStatus) => void> = [];
    const remove = jest.fn();
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_t, cb) => {
      listeners.push(cb as (st: AppStateStatus) => void);
      return { remove } as never;
    });
    api.live.mockResolvedValueOnce(liveState());
    const view = await renderWithTheme(<LiveWalkScreen />);
    await screen.findByText('01:10');

    api.live.mockResolvedValueOnce(liveState({ points: [[0, 0], [0, 1], [0, 2]], at: '2026-11-17T18:01:08Z' }));
    await act(() => listeners.forEach((cb) => cb('inactive')));
    expect(api.live).toHaveBeenCalledTimes(1);
    await act(() => listeners.forEach((cb) => cb('active')));
    await waitFor(() => expect(routeData()).toHaveLength(3));

    // e o descarte perdido aparece
    api.live.mockResolvedValueOnce(null);
    await act(() => listeners.forEach((cb) => cb('active')));
    expect(await screen.findByText('Nenhum passeio agora')).toBeOnTheScreen();
    await view.unmount();
    expect(remove).toHaveBeenCalled();
  });
});
