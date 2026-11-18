import { act, renderHookWithTheme } from '../../../test/render';
import { makePet } from '../../../test/fixtures';
import { wear, type WatchAction } from '@/services/wear';
import { usePets } from '@/store/pets';
import { useWalk } from '@/store/walk';
import { useWearCommand } from '@/store/wearCommand';
import { PUBLISH_INTERVAL_MS, handleWatchAction, toWatchState, useWearSync } from '../useWearSync';

jest.mock('@/services/wear', () => {
  let listener: ((a: string) => void) | null = null;
  return {
    wear: {
      available: true,
      publish: jest.fn(),
      onAction: jest.fn((cb: (a: string) => void) => {
        listener = cb;
        return { remove: jest.fn(() => (listener = null)) };
      }),
      __emit: (a: string) => listener?.(a),
    },
  };
});

const mockedWear = wear as typeof wear & { publish: jest.Mock; __emit: (a: WatchAction) => void; available: boolean };

const walking = (status: 'running' | 'paused' = 'running') =>
  useWalk.setState({
    status, petIds: [1], accumulatedMs: 60_000, resumedAt: null, distance: 812.4, steps: 900, points: [[-23.5, -46.6]],
    events: [
      { type: 'pee', lat: 0, lng: 0, occurred_at: 'x' },
      { type: 'pee', lat: 0, lng: 0, occurred_at: 'y' },
      { type: 'water', lat: 0, lng: 0, occurred_at: 'z' },
    ],
  });

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date('2026-11-18T12:00:00Z'));
  useWalk.getState().reset();
  useWearCommand.setState({ command: null });
  usePets.setState({ pets: [makePet()], selectedId: 1, loaded: true });
  mockedWear.available = true;
});
afterEach(() => jest.useRealTimers());

describe('toWatchState', () => {
  it('resume o passeio para o relógio: tempo, km arredondado e contagem por marcação', () => {
    walking();
    expect(toWatchState(useWalk.getState(), 'Thor')).toEqual({
      status: 'running', pet: 'Thor', elapsedMs: 60_000, at: Date.now(), distance: 812, steps: 900,
      counts: { pee: 2, poop: 0, water: 1 },
    });
  });
});

describe('handleWatchAction', () => {
  it('marcações só valem durante o passeio', () => {
    const addEvent = jest.spyOn(useWalk.getState(), 'addEvent');
    handleWatchAction('pee');
    expect(addEvent).not.toHaveBeenCalled();
    walking();
    const add = jest.spyOn(useWalk.getState(), 'addEvent');
    handleWatchAction('poop');
    expect(add).toHaveBeenCalledWith('poop');
  });

  it('pausar só se estiver rodando; retomar só se estiver pausado', () => {
    walking('paused');
    const pause = jest.spyOn(useWalk.getState(), 'pause').mockImplementation(() => undefined);
    const resume = jest.spyOn(useWalk.getState(), 'resume').mockResolvedValue();
    handleWatchAction('pause');
    expect(pause).not.toHaveBeenCalled();
    handleWatchAction('resume');
    expect(resume).toHaveBeenCalled();

    walking('running');
    pause.mockClear();
    resume.mockClear();
    handleWatchAction('resume');
    expect(resume).not.toHaveBeenCalled();
    handleWatchAction('pause');
    expect(pause).toHaveBeenCalled();
  });

  it('começar abre o passeio só se não houver um; finalizar só se houver', () => {
    handleWatchAction('finish');
    expect(useWearCommand.getState().command).toBeNull();
    handleWatchAction('start');
    expect(global.__router.navigate).toHaveBeenCalledWith('/walk');
    expect(useWearCommand.getState().command?.type).toBe('start');

    useWearCommand.setState({ command: null });
    walking();
    handleWatchAction('start');
    expect(useWearCommand.getState().command).toBeNull();
    handleWatchAction('finish');
    expect(useWearCommand.getState().command?.type).toBe('finish');
  });
});

describe('useWearSync', () => {
  it('publica na hora, depois no máximo 1x por segundo com o último estado, e para ao sair', async () => {
    const { unmount } = await renderHookWithTheme(() => useWearSync());
    expect(mockedWear.publish).toHaveBeenCalledTimes(1);
    expect(mockedWear.publish.mock.calls[0][0]).toMatchObject({ status: 'idle', pet: 'Thor' });

    await act(() => walking());
    await act(() => useWalk.setState({ steps: 950 }));
    expect(mockedWear.publish).toHaveBeenCalledTimes(1); // segurou: menos de 1s

    await act(() => jest.advanceTimersByTime(PUBLISH_INTERVAL_MS));
    expect(mockedWear.publish).toHaveBeenCalledTimes(2);
    expect(mockedWear.publish.mock.calls[1][0]).toMatchObject({ status: 'running', steps: 950 });

    // passou mais de 1s desde a última: publica na hora
    await act(() => jest.advanceTimersByTime(PUBLISH_INTERVAL_MS * 2));
    await act(() => useWalk.setState({ steps: 999 }));
    expect(mockedWear.publish).toHaveBeenCalledTimes(3);

    await act(() => useWalk.setState({ steps: 1000 })); // agenda...
    await unmount(); // ...e sair cancela
    await act(() => jest.advanceTimersByTime(PUBLISH_INTERVAL_MS * 2));
    expect(mockedWear.publish).toHaveBeenCalledTimes(3);
  });

  it('sair sem nada agendado também limpa; toques do relógio chegam ao passeio', async () => {
    const { unmount } = await renderHookWithTheme(() => useWearSync());
    walking();
    const add = jest.spyOn(useWalk.getState(), 'addEvent');
    mockedWear.__emit('water');
    expect(add).toHaveBeenCalledWith('water');
    await act(() => jest.advanceTimersByTime(PUBLISH_INTERVAL_MS * 2));
    await unmount();
  });

  it('sem relógio/módulo nativo não publica nada; sem pet manda pet nulo', async () => {
    mockedWear.available = false;
    await renderHookWithTheme(() => useWearSync());
    expect(mockedWear.publish).not.toHaveBeenCalled();

    mockedWear.available = true;
    await act(() => usePets.setState({ pets: [], selectedId: null }));
    await renderHookWithTheme(() => useWearSync());
    expect(mockedWear.publish.mock.calls[0][0]).toMatchObject({ pet: null });
  });
});
