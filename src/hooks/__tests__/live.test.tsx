import { AxiosError } from 'axios';
import * as Notifications from 'expo-notifications';
import { act, renderHookWithTheme } from '../../../test/render';
import { makePet, makeWalk, user } from '../../../test/fixtures';
import * as apiModule from '@/services/api';
import { realtimeFromEnv } from '@/services/realtime';
import type { LatLng, LiveWalk } from '@/services/types';
import { useAuth } from '@/store/auth';
import { useLive } from '@/store/live';
import { usePets } from '@/store/pets';
import { useToastStore } from '@/store/toast';
import { useWalk } from '@/store/walk';
import { LIVE_INTERVAL_MS, useLiveBroadcast } from '../useLiveBroadcast';
import { useNotificationLinks } from '../useNotificationLinks';
import { useOwnerLive } from '../useOwnerLive';

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  api: { liveStart: jest.fn(), liveProgress: jest.fn(), liveFinish: jest.fn(), liveCancel: jest.fn(), live: jest.fn() },
}));
jest.mock('@/services/realtime', () => ({ realtimeFromEnv: jest.fn() }));

const { api } = jest.mocked(apiModule);
beforeEach(() => Object.values(api).forEach((fn) => (fn as jest.Mock).mockReset()));

const flush = async () => {
  for (let i = 0; i < 10; i += 1) await Promise.resolve();
};
const conflict = () => new AxiosError('conflito', '409', undefined, undefined, { status: 409 } as never);
const offline = () => new AxiosError('sem rede', 'ERR_NETWORK');

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const pets = [
  makePet({ id: 1, name: 'Thor' }),
  makePet({ id: 3, name: 'Bidu', role: 'walker', owner_name: 'Ana' }),
  makePet({ id: 4, name: 'Nina', role: 'walker', owner_name: 'Ana' }),
];

/** O passeio "andou": coloca pontos, distância e marcações direto no store. */
function walked(points: LatLng[], extra: Partial<ReturnType<typeof useWalk.getState>> = {}) {
  useWalk.setState({ status: 'running', points, distance: points.length * 10.4, steps: points.length * 3, ...extra });
}
const tick = async () => {
  jest.advanceTimersByTime(LIVE_INTERVAL_MS);
  await flush();
};

describe('useLiveBroadcast (passeador transmite)', () => {
  const live = useLiveBroadcast();

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-17T18:00:00Z'));
    usePets.setState({ pets, selectedId: 3, loaded: true });
    useWalk.setState({ status: 'running', petIds: [1, 3, 4], accumulatedMs: 0, resumedAt: Date.now(), points: [], distance: 0, steps: 0, events: [] });
    api.liveStart.mockResolvedValue({ session: 'S1' });
    api.liveProgress.mockResolvedValue({} as never);
    api.liveFinish.mockResolvedValue({} as never);
    api.liveCancel.mockResolvedValue({} as never);
  });
  afterEach(() => {
    live.cancel();
    jest.useRealTimers();
  });

  it('passeio só com pets meus não transmite nada', async () => {
    live.start([1]);
    await tick();
    expect(api.liveStart).not.toHaveBeenCalled();
    expect(api.liveProgress).not.toHaveBeenCalled();
  });

  it('abre a sessão só com os pets de passeio e manda o andamento a cada 5 s com só os pontos novos', async () => {
    live.start([1, 3, 4]);
    await flush();
    expect(api.liveStart).toHaveBeenCalledWith([3, 4]);

    walked([[0, 0], [0, 1]], { events: [{ type: 'pee', lat: 0, lng: 1, occurred_at: 'x' }, { type: 'water', lat: 0, lng: 1, occurred_at: 'x' }] });
    jest.advanceTimersByTime(LIVE_INTERVAL_MS - 1);
    await flush();
    expect(api.liveProgress).not.toHaveBeenCalled(); // ainda não deu 5 s
    jest.advanceTimersByTime(1);
    await flush();
    expect(api.liveProgress).toHaveBeenLastCalledWith('S1', {
      pet_ids: [3, 4], status: 'running', elapsed_ms: 5000, distance: 21, steps: 6, points: [[0, 0], [0, 1]], counts: { pee: 1, poop: 0, water: 1 },
    });

    walked([[0, 0], [0, 1], [0, 2]], { status: 'paused' });
    await tick();
    expect(api.liveProgress).toHaveBeenLastCalledWith('S1', expect.objectContaining({ status: 'paused', points: [[0, 2]] }));
  });

  it('sem rede: o passeio segue e o próximo envio leva também os pontos que não foram', async () => {
    api.liveStart.mockRejectedValueOnce(offline());
    live.start([3]);
    await flush();
    expect(api.liveProgress).not.toHaveBeenCalled();

    await tick(); // tenta abrir de novo
    expect(api.liveStart).toHaveBeenCalledTimes(2);

    walked([[0, 0]]);
    api.liveProgress.mockRejectedValueOnce(offline());
    await tick();
    walked([[0, 0], [0, 1]]);
    await tick();
    expect(api.liveProgress).toHaveBeenLastCalledWith('S1', expect.objectContaining({ points: [[0, 0], [0, 1]] }));
    expect(useWalk.getState().status).toBe('running');
  });

  it('409 (passeio encerrado ou outra sessão): para de transmitir em silêncio', async () => {
    live.start([3]);
    await flush();
    api.liveProgress.mockRejectedValueOnce(conflict());
    await tick();
    await tick();
    expect(api.liveProgress).toHaveBeenCalledTimes(1);
    expect(useToastStore.getState().current).toBeNull();
  });

  it('não acumula envios se a rede está lenta', async () => {
    live.start([3]);
    await flush();
    api.liveProgress.mockReturnValueOnce(new Promise(() => undefined));
    await tick();
    await tick();
    expect(api.liveProgress).toHaveBeenCalledTimes(1);
  });

  it('salvou: fecha a transmissão com o registro de cada pet de passeio (os meus ficam de fora)', async () => {
    live.start([1, 3, 4]);
    await flush();
    const saved = makeWalk({ id: 50, pet_id: 1, group_walks: [{ pet_id: 1, walk_id: 50 }, { pet_id: 3, walk_id: 51 }, { pet_id: 4, walk_id: 52 }] });
    await live.finish(saved);
    expect(api.liveFinish).toHaveBeenCalledWith('S1', [{ pet_id: 3, walk_id: 51 }, { pet_id: 4, walk_id: 52 }]);

    await tick(); // acabou: não manda mais nada
    expect(api.liveProgress).not.toHaveBeenCalled();
  });

  it('salvou: pet que não veio em group_walks fica de fora; nenhum, nada a fechar', async () => {
    live.start([3, 4]);
    await flush();
    await live.finish(makeWalk({ id: 51, pet_id: 3, group_walks: [{ pet_id: 3, walk_id: 51 }] }));
    expect(api.liveFinish).toHaveBeenCalledWith('S1', [{ pet_id: 3, walk_id: 51 }]);

    api.liveFinish.mockClear();
    live.start([3]);
    await flush();
    await live.finish(makeWalk({ id: 50, pet_id: 1 })); // resposta sem group_walks
    expect(api.liveFinish).not.toHaveBeenCalled();
  });

  it('salvou sem rede: não quebra', async () => {
    live.start([3]);
    await flush();
    api.liveFinish.mockRejectedValueOnce(offline());
    await expect(live.finish(makeWalk({ id: 51, pet_id: 3, group_walks: [{ pet_id: 3, walk_id: 51 }] }))).resolves.toBeUndefined();
    expect(api.liveFinish).toHaveBeenCalledTimes(1);
  });

  it('descartou: avisa que o passeio foi cancelado', async () => {
    live.start([1, 3, 4]);
    await flush();
    api.liveCancel.mockRejectedValueOnce(offline());
    live.cancel();
    await flush();
    expect(api.liveCancel).toHaveBeenCalledWith('S1', [3, 4]);
    await tick();
    expect(api.liveProgress).not.toHaveBeenCalled();
  });

  it('acabou antes de a sessão abrir: fecha a sessão quando ela chega (sem passeio fantasma)', async () => {
    const opening = deferred<{ session: string }>();
    api.liveStart.mockReturnValueOnce(opening.promise);
    live.start([3]);
    await live.finish(makeWalk({ id: 50, pet_id: 3, group_walks: [{ pet_id: 3, walk_id: 50 }] }));
    expect(api.liveFinish).not.toHaveBeenCalled();
    api.liveCancel.mockRejectedValueOnce(offline());
    opening.resolve({ session: 'S0' });
    await flush();
    expect(api.liveCancel).toHaveBeenCalledWith('S0', [3]);
    live.cancel(); // sem sessão: nada a avisar
    expect(api.liveCancel).toHaveBeenCalledTimes(1);
  });

  it('resposta atrasada do passeio anterior não mexe no novo', async () => {
    live.start([3]);
    await flush();
    const late = deferred<unknown>();
    api.liveProgress.mockReturnValueOnce(late.promise as never);
    walked([[0, 0]]);
    await tick();
    live.cancel();

    api.liveStart.mockResolvedValueOnce({ session: 'S2' });
    live.start([3]);
    await flush();
    late.reject(conflict()); // 409 do passeio velho não para o novo
    await flush();
    await tick();
    expect(api.liveProgress).toHaveBeenLastCalledWith('S2', expect.objectContaining({ points: [[0, 0]] }));

    // e o sucesso atrasado também não conta os pontos do novo como enviados
    const late2 = deferred<unknown>();
    api.liveProgress.mockReturnValueOnce(late2.promise as never);
    await tick();
    live.cancel();
    api.liveStart.mockResolvedValueOnce({ session: 'S3' });
    live.start([3]);
    await flush();
    late2.resolve({});
    await flush();
    await tick();
    expect(api.liveProgress).toHaveBeenLastCalledWith('S3', expect.objectContaining({ points: [[0, 0]] }));
  });
});

type Listener = { channel: string; cb: (data: unknown) => void; off: jest.Mock };

function fakeRealtime() {
  const listeners: Listener[] = [];
  const client = {
    close: jest.fn(),
    subscribe: jest.fn((channel: string, _event: string, cb: (data: unknown) => void) => {
      const off = jest.fn();
      listeners.push({ channel, cb, off });
      return off;
    }),
  };
  jest.mocked(realtimeFromEnv).mockReturnValue(client);
  const emit = (channel: string, data: unknown) =>
    act(() => listeners.filter((l) => l.channel === channel).forEach((l) => l.cb(data)));
  return { client, listeners, emit };
}

const liveState = (overrides: Partial<LiveWalk> = {}): LiveWalk => ({
  session: 'S1', status: 'running', walker: { id: 9, name: 'João' }, pet_id: 1, pet_names: ['Thor'], started_at: '2026-11-17T18:00:00Z',
  elapsed_ms: 0, at: '2026-11-17T18:00:00Z', distance: 0, steps: 0, counts: { pee: 0, poop: 0, water: 0 }, ...overrides,
});

describe('useOwnerLive (pai/mãe de pet acompanha)', () => {
  const ownerPets = [makePet({ id: 1, name: 'Thor' }), makePet({ id: 2, name: 'Mel' }), makePet({ id: 3, name: 'Bidu', role: 'walker' })];
  const scheduled = () => jest.mocked(Notifications.scheduleNotificationAsync).mock.calls.map((c) => c[0].content);

  beforeEach(() => {
    useAuth.setState({ status: 'signedIn', user });
    usePets.setState({ pets: ownerPets, selectedId: 1, loaded: true });
    useLive.getState().reset();
    useToastStore.setState({ current: null } as never);
    api.live.mockResolvedValue(null);
  });

  it('escuta só os pets de que é pai/mãe', async () => {
    const { client } = fakeRealtime();
    await renderHookWithTheme(useOwnerLive);
    expect(client.subscribe.mock.calls.map((c) => [c[0], c[1]])).toEqual([
      ['private-pet.1', 'live.updated'],
      ['private-pet.2', 'live.updated'],
    ]);
    expect(api.live).toHaveBeenCalledWith(1);
    expect(api.live).not.toHaveBeenCalledWith(3);
  });

  it('deslogado ou sem pets próprios: não conecta / não assina', async () => {
    useAuth.setState({ status: 'signedOut' });
    const { client } = fakeRealtime();
    await renderHookWithTheme(useOwnerLive);
    expect(realtimeFromEnv).not.toHaveBeenCalled();

    await act(() => {
      useAuth.setState({ status: 'signedIn' });
      usePets.setState({ pets: [ownerPets[2]] });
    });
    await renderHookWithTheme(useOwnerLive);
    expect(client.subscribe).not.toHaveBeenCalled();
  });

  it('sessão nova: avisa uma vez (notificação + toast), mesmo com o grupo chegando por dois pets', async () => {
    const { emit } = fakeRealtime();
    await renderHookWithTheme(useOwnerLive);
    await emit('private-pet.1', liveState({ session: 'N1', pet_names: ['Thor', 'Mel'] }));
    await emit('private-pet.2', liveState({ session: 'N1', pet_id: 2, pet_names: ['Thor', 'Mel'] }));
    await emit('private-pet.1', liveState({ session: 'N1', new_points: [[0, 0]] }));
    await act(flush);

    expect(scheduled()).toEqual([
      expect.objectContaining({ title: 'Thor e Mel saíram para passear com João', data: { url: '/live/1' } }),
    ]);
    expect(useToastStore.getState().current).toMatchObject({ type: 'success', message: 'Thor e Mel saíram para passear com João.' });
    expect(useLive.getState().byPet[1]).toMatchObject({ session: 'N1', points: [[0, 0]] });
    expect(useLive.getState().byPet[2]).toMatchObject({ session: 'N1' });
  });

  it('voltou: avisa com km e minutos, uma vez', async () => {
    const { emit } = fakeRealtime();
    await renderHookWithTheme(useOwnerLive);
    const done = liveState({ session: 'N2', status: 'finished', distance: 2140, elapsed_ms: 42 * 60000, walk_id: 80 });
    await emit('private-pet.1', done);
    await emit('private-pet.1', done);
    await emit('private-pet.2', liveState({ session: 'N3', status: 'finished', pet_names: ['Thor', 'Mel'], elapsed_ms: 1000 }));
    await act(flush);
    expect(scheduled()).toEqual([
      expect.objectContaining({ title: 'Thor voltou', body: '2,1 km em 42 min com João.', data: { url: '/live/1' } }),
      expect.objectContaining({ title: 'Thor e Mel voltaram', body: '0,0 km em 1 min com João.', data: { url: '/live/2' } }),
    ]);
  });

  it('passeio que já estava rolando ao abrir o app: aparece sem notificar de novo', async () => {
    api.live.mockImplementation(async (id) =>
      id === 1 ? liveState({ session: 'OLD', points: [[0, 0]] }) : liveState({ session: 'DONE', status: 'finished', pet_id: 2 }),
    );
    const { emit } = fakeRealtime();
    await renderHookWithTheme(useOwnerLive);
    await act(flush);
    expect(useLive.getState().byPet[1]).toMatchObject({ session: 'OLD', points: [[0, 0]] });

    await emit('private-pet.1', liveState({ session: 'OLD', new_points: [[0, 1]] }));
    await emit('private-pet.2', liveState({ session: 'DONE', status: 'finished', pet_id: 2 }));
    await act(flush);
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    expect(useLive.getState().byPet[1].points).toEqual([[0, 0], [0, 1]]);
  });

  it('ignora resposta com erro e payload inválido; descartado vira estado "cancelled"', async () => {
    api.live.mockRejectedValue(new Error('x'));
    const { emit } = fakeRealtime();
    await renderHookWithTheme(useOwnerLive);
    await act(flush);
    await emit('private-pet.1', undefined);
    await emit('private-pet.1', { session: 'X' });
    expect(useLive.getState().byPet).toEqual({});

    await emit('private-pet.1', liveState({ session: 'C1' }));
    await emit('private-pet.1', { session: 'C1', pet_id: 1, status: 'cancelled' });
    expect(useLive.getState().byPet[1]).toMatchObject({ status: 'cancelled', walker: { name: 'João' } });
    // sessão diferente começa do zero
    await emit('private-pet.1', liveState({ session: 'C2', status: 'paused' }));
    expect(useLive.getState().byPet[1]).toMatchObject({ session: 'C2', points: [] });
  });

  it('sair da conta: deixa de escutar, fecha a conexão e esquece o estado', async () => {
    const { client, listeners, emit } = fakeRealtime();
    await renderHookWithTheme(useOwnerLive);
    await emit('private-pet.1', liveState({ session: 'Z1' }));
    await act(() => useAuth.setState({ status: 'signedOut' }));
    expect(listeners.every((l) => l.off.mock.calls.length === 1)).toBe(true);
    expect(client.close).toHaveBeenCalled();
    expect(useLive.getState().byPet).toEqual({});
  });

  it('desmontar deixa de escutar; pet novo passa a ser escutado', async () => {
    const { client, listeners } = fakeRealtime();
    const hook = await renderHookWithTheme(useOwnerLive);
    await act(() => usePets.getState().upsert(makePet({ id: 5, name: 'Rex' })));
    expect(client.subscribe).toHaveBeenLastCalledWith('private-pet.5', 'live.updated', expect.any(Function));
    await hook.unmount();
    expect(listeners.every((l) => l.off.mock.calls.length === 1)).toBe(true);
  });
});

describe('useNotificationLinks', () => {
  const response = (identifier: string, data: Record<string, unknown>) =>
    ({ notification: { request: { identifier, content: { data } } } }) as never;

  beforeEach(() => useAuth.setState({ status: 'signedIn', user }));

  it('abriu o app tocando no aviso: vai para a tela do link, uma vez só', async () => {
    jest.mocked(Notifications.getLastNotificationResponse).mockReturnValue(response('n1', { url: '/live/1' }));
    await renderHookWithTheme(useNotificationLinks);
    expect(global.__router.push).toHaveBeenCalledWith('/live/1');

    await act(() => useAuth.setState({ status: 'signedOut' }));
    await act(() => useAuth.setState({ status: 'signedIn' }));
    expect(global.__router.push).toHaveBeenCalledTimes(1);
    jest.mocked(Notifications.getLastNotificationResponse).mockReturnValue(null);
  });

  it('toque com o app aberto abre o link; aviso sem link é ignorado; deslogado não escuta', async () => {
    const remove = jest.fn();
    jest.mocked(Notifications.addNotificationResponseReceivedListener).mockReturnValue({ remove } as never);
    const hook = await renderHookWithTheme(useNotificationLinks);
    const listener = jest.mocked(Notifications.addNotificationResponseReceivedListener).mock.calls[0][0];
    listener(response('n2', {}));
    expect(global.__router.push).not.toHaveBeenCalled();
    listener(response('n3', { url: '/live/2' }));
    expect(global.__router.push).toHaveBeenCalledWith('/live/2');
    await hook.unmount();
    expect(remove).toHaveBeenCalled();

    jest.mocked(Notifications.addNotificationResponseReceivedListener).mockClear();
    useAuth.setState({ status: 'signedOut' });
    await renderHookWithTheme(useNotificationLinks);
    expect(Notifications.addNotificationResponseReceivedListener).not.toHaveBeenCalled();
  });
});
