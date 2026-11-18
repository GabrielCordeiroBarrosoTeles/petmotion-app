import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { act, answerConfirm, fireEvent, renderWithTheme, screen, waitFor } from '../../../test/render';
import { makePet, makeStats, weather } from '../../../test/fixtures';
import * as apiModule from '@/services/api';
import { usePets } from '@/store/pets';
import { useSettings } from '@/store/settings';
import { useToastStore } from '@/store/toast';
import { useWalk } from '@/store/walk';
import { useWearCommand } from '@/store/wearCommand';
import { WalkScreen } from '../Walk';

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  api: { stats: jest.fn(), createWalk: jest.fn(), weather: jest.fn() },
}));
const { api } = jest.mocked(apiModule);
// respostas "Once" não podem vazar de um teste para o outro
const resetApi = () => Object.values(api).forEach((fn) => (fn as jest.Mock).mockReset());
beforeEach(resetApi);

/** Avança a contagem 3-2-1-Vai! (750ms por número, 450ms no "Vai!"). */
async function runCountdown() {
  for (const ms of [750, 750, 750, 450]) await act(() => jest.advanceTimersByTime(ms));
}

/** Liga o GPS falso e devolve uma função para "andar". */
function fakeGps() {
  let emit: (lat: number, lng: number) => void = () => undefined;
  jest.mocked(Location.watchPositionAsync).mockImplementation(async (_o, cb) => {
    emit = (latitude, longitude) => cb({ coords: { latitude, longitude, accuracy: 5 } } as never);
    return { remove: jest.fn() };
  });
  return (lat: number, lng: number) => act(() => emit(lat, lng));
}

beforeEach(async () => {
  jest.useFakeTimers({ advanceTimers: true }).setSystemTime(new Date('2026-11-17T18:00:00Z'));
  usePets.setState({ pets: [makePet()], selectedId: 1, loaded: true });
  useSettings.setState({ demoMode: false });
  api.weather.mockResolvedValue(weather);
  api.stats.mockResolvedValue(makeStats());
  useWalk.getState().reset();
});
afterEach(async () => {
  await act(() => useWalk.getState().reset());
  jest.useRealTimers();
});

describe('Passeio: antes de começar', () => {
  it('sem pet manda cadastrar', async () => {
    usePets.setState({ pets: [], selectedId: null });
    await renderWithTheme(<WalkScreen />);
    expect(global.__router.replace).toHaveBeenCalledWith('/pet-form');
    expect(useToastStore.getState().current?.message).toBe('Cadastre um pet antes de passear.');
    const before = jest.mocked(Location.requestForegroundPermissionsAsync).mock.calls.length; // o clima já pediu ao abrir
    await fireEvent.press(screen.getByLabelText('Começar passeio')); // sem pet: não faz nada
    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(before);
  });

  it('sem permissão de localização explica o que fazer', async () => {
    jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValueOnce({ granted: true } as never); // do clima
    jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValueOnce({ granted: false } as never);
    await renderWithTheme(<WalkScreen />);
    expect(await screen.findByText(/Pronto pra sair/)).toBeOnTheScreen();
    await fireEvent.press(screen.getByLabelText('Começar passeio'));
    await waitFor(() => expect(useToastStore.getState().current?.type).toBe('danger'));
    expect(screen.queryByText('3')).toBeNull();
  });

  it('avisa do asfalto quente, conta 3-2-1 e começa a rastrear', async () => {
    api.weather.mockResolvedValue({ ...weather, level: 'danger', message: 'Asfalto quente!' });
    await renderWithTheme(<WalkScreen />);
    expect(await screen.findByText('22°C')).toBeOnTheScreen();
    await fireEvent.press(screen.getByLabelText('Começar passeio'));
    await waitFor(() => expect(screen.getByText('3')).toBeOnTheScreen());
    expect(useToastStore.getState().current?.message).toBe('Asfalto quente!');

    await runCountdown();
    await waitFor(() => expect(useWalk.getState().status).toBe('running'));
    expect(useWalk.getState().temperature).toBe(22);
    expect(screen.getByText('Procurando GPS…')).toBeOnTheScreen();
  });

  it('pedido do relógio: "começar" dispara a contagem; repetido no meio não faz nada', async () => {
    await renderWithTheme(<WalkScreen />);
    expect(await screen.findByText(/Pronto pra sair/)).toBeOnTheScreen();
    await act(() => useWearCommand.getState().send('finish')); // ainda não começou: ignora
    expect(useWearCommand.getState().command).toBeNull();
    await act(() => useWearCommand.getState().send('start'));
    await waitFor(() => expect(screen.getByText('3')).toBeOnTheScreen());
    expect(useWearCommand.getState().command).toBeNull();
  });

  it('modo apresentação não pede GPS e mostra o selo "Simulado"', async () => {
    useSettings.setState({ demoMode: true });
    api.weather.mockRejectedValue(new Error('sem clima'));
    api.stats.mockRejectedValue(new Error('offline')); // conquistas antes do passeio são opcionais
    await renderWithTheme(<WalkScreen />);
    expect(screen.getByText('Simulado')).toBeOnTheScreen();
    await fireEvent.press(screen.getByLabelText('Começar passeio'));
    await runCountdown();
    await waitFor(() => expect(useWalk.getState().gpsReady).toBe(true));
    expect(useWalk.getState().temperature).toBeNull();
  });

  it('se o GPS falhar ao iniciar, volta para a tela inicial com aviso', async () => {
    jest.mocked(Location.watchPositionAsync).mockRejectedValueOnce(new Error('gps quebrado'));
    await renderWithTheme(<WalkScreen />);
    await fireEvent.press(screen.getByLabelText('Começar passeio'));
    await runCountdown();
    await waitFor(() => expect(useToastStore.getState().current?.message).toMatch(/Não foi possível iniciar o GPS/));
    expect(useWalk.getState().status).toBe('idle');
    expect(screen.getByLabelText('Começar passeio')).toBeOnTheScreen();
  });
});

describe('Passeio: em andamento', () => {
  async function startWalking() {
    const walk = fakeGps();
    await renderWithTheme(<WalkScreen />);
    await fireEvent.press(screen.getByLabelText('Começar passeio'));
    await runCountdown();
    await waitFor(() => expect(useWalk.getState().status).toBe('running'));
    return walk;
  }

  it('marca eventos só com GPS, pausa e retoma', async () => {
    const walk = await startWalking();
    await fireEvent.press(screen.getByLabelText('Marcar Xixi. 0 até agora'));
    expect(useToastStore.getState().current?.message).toBe('Aguardando o GPS para marcar o ponto.');

    await walk(-23.5, -46.6);
    await fireEvent.press(screen.getByLabelText('Marcar Água. 0 até agora'));
    expect(screen.getByLabelText('Marcar Água. 1 até agora')).toBeOnTheScreen();

    await fireEvent.press(screen.getByLabelText('Pausar passeio'));
    expect(screen.getByText('Pausado')).toBeOnTheScreen();
    await fireEvent.press(screen.getByLabelText('Retomar passeio'));
    await waitFor(() => expect(useWalk.getState().status).toBe('running'));
  });

  it('várias marcações seguidas não repetem chave entre a onda e o contador', async () => {
    const walk = await startWalking();
    await walk(-23.5, -46.6);
    const error = jest.spyOn(console, 'error');
    for (let i = 0; i < 3; i += 1) await fireEvent.press(screen.getByLabelText(`Marcar Cocô. ${i} até agora`));
    expect(screen.getByLabelText('Marcar Cocô. 3 até agora')).toBeOnTheScreen();
    expect(error).not.toHaveBeenCalledWith(expect.stringContaining('same key'), expect.anything(), expect.anything());
    expect(error.mock.calls.flat().join(' ')).not.toContain('same key');
    error.mockRestore();
  });

  it('descartar pede confirmação e encerra sem salvar nada', async () => {
    const walk = await startWalking();
    await walk(-23.5, -46.6);
    await walk(-23.5, -46.601);

    await fireEvent.press(screen.getByLabelText('Descartar passeio'));
    await answerConfirm(false);
    expect(useWalk.getState().status).toBe('running');

    await fireEvent.press(screen.getByLabelText('Descartar passeio'));
    await answerConfirm(true);
    expect(useWalk.getState().status).toBe('idle');
    expect(api.createWalk).not.toHaveBeenCalled();
    expect(Notifications.dismissNotificationAsync).toHaveBeenCalled();
    expect(useToastStore.getState().current?.message).toBe('Passeio descartado.');
    expect(global.__router.back).toHaveBeenCalled();
  });

  it('atualiza a notificação fixa a cada 15 segundos', async () => {
    jest.mocked(Notifications.getPermissionsAsync).mockRejectedValueOnce(new Error('sem permissão')); // não impede o passeio
    await startWalking();
    jest.mocked(Notifications.scheduleNotificationAsync).mockClear();
    await act(() => jest.advanceTimersByTime(1000)); // segundos que não são múltiplos de 15 não notificam
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    await act(() => jest.advanceTimersByTime(14_000)); // chega aos 15s
    await waitFor(() => expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({ identifier: 'walk-in-progress' })));
  });

  it('passeio curto demais não é salvo e continua rodando', async () => {
    await startWalking();
    await fireEvent(screen.getByLabelText('Segure para finalizar'), 'pressIn');
    expect(useToastStore.getState().current?.message).toMatch(/muito curto/);
    await waitFor(() => expect(useWalk.getState().status).toBe('running'));
    expect(api.createWalk).not.toHaveBeenCalled();
  });

  it('dois pontos, mas menos de 30 m (ficou parado): também não salva', async () => {
    const walk = await startWalking();
    await walk(-23.5, -46.6);
    await walk(-23.5001, -46.6); // ~11 m
    expect(useWalk.getState().points).toHaveLength(2);
    await fireEvent(screen.getByLabelText('Segure para finalizar'), 'pressIn');
    expect(useToastStore.getState().current?.message).toMatch(/muito curto/);
    expect(api.createWalk).not.toHaveBeenCalled();
  });

  it('pedido do relógio: "finalizar" salva o passeio como o botão de segurar', async () => {
    const walk = await startWalking();
    await walk(-23.5, -46.6);
    await walk(-23.5, -46.601);
    api.createWalk.mockResolvedValueOnce({ id: 78 } as never);
    await act(() => useWearCommand.getState().send('start')); // já está passeando: ignora
    await act(() => useWearCommand.getState().send('finish'));
    await waitFor(() => expect(api.createWalk).toHaveBeenCalled());
  });

  it('salva e abre o resumo com as conquistas de antes', async () => {
    const walk = await startWalking();
    await walk(-23.5, -46.6);
    await walk(-23.5, -46.601);
    api.createWalk.mockResolvedValueOnce({ id: 77 } as never);
    await fireEvent(screen.getByLabelText('Segure para finalizar'), 'pressIn');
    await waitFor(() =>
      expect(global.__router.replace).toHaveBeenCalledWith({ pathname: '/walk-summary', params: { id: '77', before: 'first_walk' } }),
    );
    expect(useWalk.getState().status).toBe('idle');
    expect(Notifications.dismissNotificationAsync).toHaveBeenCalled();
  });

  it('erro ao salvar mostra o motivo e mantém o passeio', async () => {
    const walk = await startWalking();
    await walk(-23.5, -46.6);
    await walk(-23.5, -46.601);
    api.createWalk.mockRejectedValueOnce(new Error('offline'));
    await fireEvent(screen.getByLabelText('Segure para finalizar'), 'pressIn');
    await waitFor(() => expect(useToastStore.getState().current?.type).toBe('danger'));
    expect(screen.queryByText('Salvando o passeio…')).toBeNull();
    expect(useWalk.getState().points).toHaveLength(2);
  });

  it('finalizar sem passeio ativo não faz nada; minimizar volta', async () => {
    await startWalking();
    await act(() => useWalk.setState({ petIds: [] }));
    await fireEvent(screen.getByLabelText('Segure para finalizar'), 'pressIn');
    expect(api.createWalk).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByLabelText('Minimizar passeio'));
    expect(global.__router.back).toHaveBeenCalled();
  });

  it('se o pet sumir durante a contagem, volta para o início em vez de travar', async () => {
    await renderWithTheme(<WalkScreen />);
    await fireEvent.press(screen.getByLabelText('Começar passeio'));
    await act(() => usePets.setState({ pets: [], selectedId: null }));
    await runCountdown();
    expect(useWalk.getState().status).toBe('idle');
    expect(screen.queryByText('Vai!')).toBeNull();
    expect(screen.getByLabelText('Começar passeio')).toBeOnTheScreen();
  });

  it('passeio rodando sem pet não notifica nem quebra a legenda', async () => {
    usePets.setState({ pets: [], selectedId: null });
    useWalk.setState({ status: 'running', petIds: [1], startedAt: new Date().toISOString(), resumedAt: Date.now() });
    await renderWithTheme(<WalkScreen />);
    jest.mocked(Notifications.scheduleNotificationAsync).mockClear();
    await act(() => jest.advanceTimersByTime(15_000));
    expect(screen.getByText('Passeando com')).toBeOnTheScreen();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('abrir com um passeio já rodando vai direto para o rastreio', async () => {
    useWalk.setState({ status: 'paused', petIds: [1], startedAt: new Date().toISOString(), accumulatedMs: 61_000 });
    await renderWithTheme(<WalkScreen />);
    expect(screen.getByText('01:01')).toBeOnTheScreen();
    expect(screen.getByText('Pausado')).toBeOnTheScreen();
    await fireEvent.press(screen.getByLabelText('Minimizar passeio'));
  });
});

describe('Passeio em grupo', () => {
  const ana = { role: 'walker' as const, owner_name: 'Ana' };
  const threePets = () =>
    usePets.setState({
      pets: [makePet(), makePet({ id: 2, name: 'Mel' }), makePet({ id: 3, name: 'Bidu', ...ana }), makePet({ id: 4, name: 'Nina', ...ana })],
      selectedId: 1,
      loaded: true,
    });

  it('com um pet só, não pergunta quem vai junto', async () => {
    await renderWithTheme(<WalkScreen />);
    expect(await screen.findByText('Pronto pra sair com Thor?')).toBeOnTheScreen();
    expect(screen.queryByText('Quem vai junto?')).toBeNull();
  });

  it('só com pets de passeio, não mostra "Seus pets" e junta os do mesmo dono', async () => {
    usePets.setState({
      pets: [makePet({ id: 3, name: 'Bidu', ...ana }), makePet({ id: 4, name: 'Nina', ...ana }), makePet({ id: 5, name: 'Rex', role: 'walker', owner_name: 'Carlos' })],
      selectedId: 3,
    });
    await renderWithTheme(<WalkScreen />);
    expect(screen.queryByText('Seus pets')).toBeNull();
    expect(screen.getByText('Pets de Ana')).toBeOnTheScreen();
    expect(screen.getByText('Pets de Carlos')).toBeOnTheScreen();
  });

  it('sem nome do dono, o grupo se chama "Pets compartilhados"', async () => {
    usePets.setState({ pets: [makePet({ id: 3, name: 'Bidu', role: 'walker' }), makePet({ id: 4, name: 'Nina', role: 'walker' })], selectedId: 3 });
    await renderWithTheme(<WalkScreen />);
    expect(screen.getByText('Pets compartilhados')).toBeOnTheScreen();
  });

  it('se todos os marcados saírem da lista, volta para o pet selecionado', async () => {
    threePets();
    await renderWithTheme(<WalkScreen />);
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Mel' }));
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Thor' }));
    await act(() => usePets.getState().remove(2));
    expect(screen.getByText(/com Thor\?/)).toBeOnTheScreen();
  });

  it('agrupa por dono, marca o selecionado e nunca deixa desmarcar o último', async () => {
    threePets();
    await renderWithTheme(<WalkScreen />);
    expect(screen.getByText('Quem vai junto?')).toBeOnTheScreen();
    expect(screen.getByText('Seus pets')).toBeOnTheScreen();
    expect(screen.getAllByText('Pets de Ana')).toHaveLength(1);
    expect(screen.getByRole('checkbox', { name: 'Thor', checked: true })).toBeOnTheScreen();
    expect(screen.getByRole('checkbox', { name: 'Mel', checked: false })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('checkbox', { name: 'Thor' })); // último marcado: nada acontece
    expect(screen.getByRole('checkbox', { name: 'Thor', checked: true })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('checkbox', { name: 'Bidu' }));
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Mel' }));
    expect(screen.getByText(/Pronto pra sair\s+com Thor, Mel e Bidu\?/)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Thor' })); // agora dá para desmarcar
    expect(screen.getByText(/com Mel e Bidu\?/)).toBeOnTheScreen();
  });

  it('começa com todos marcados e manda companion_ids ao salvar', async () => {
    threePets();
    const walk = fakeGps();
    await renderWithTheme(<WalkScreen />);
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Mel' }));
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Bidu' }));
    await fireEvent.press(screen.getByLabelText('Começar passeio'));
    await runCountdown();
    await waitFor(() => expect(useWalk.getState().petIds).toEqual([1, 2, 3]));
    expect(screen.getByText('Passeando com Thor, Mel e Bidu')).toBeOnTheScreen();
    await walk(-23.5, -46.6);
    await walk(-23.5, -46.601);
    api.createWalk.mockResolvedValueOnce({ id: 90 } as never);
    await fireEvent(screen.getByLabelText('Segure para finalizar'), 'pressIn');
    await waitFor(() => expect(api.createWalk).toHaveBeenCalledWith(expect.objectContaining({ pet_id: 1, companion_ids: [2, 3] })));
  });

  it('se um pet marcado sumir durante a contagem, segue só com quem sobrou', async () => {
    threePets();
    await renderWithTheme(<WalkScreen />);
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Mel' }));
    await fireEvent.press(screen.getByLabelText('Começar passeio'));
    await act(() => usePets.getState().remove(2));
    await runCountdown();
    await waitFor(() => expect(useWalk.getState().petIds).toEqual([1]));
  });
});

