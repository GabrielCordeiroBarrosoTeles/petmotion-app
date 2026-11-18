import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors';
import { elapsedMs, useWalk } from '../walk';

const watchPosition = jest.mocked(Location.watchPositionAsync);
const flush = () => Promise.resolve();
/** O modo simulado já dá o primeiro passo ao lado da origem. */
const expectNear = (point: number[], [lat, lng]: number[]) => {
  expect(point[0]).toBeCloseTo(lat, 3);
  expect(point[1]).toBeCloseTo(lng, 3);
};

/** Captura o callback do GPS para "andar" com pontos falsos. */
function captureGps() {
  let emit: (lat: number, lng: number, accuracy?: number) => void = () => undefined;
  const remove = jest.fn();
  watchPosition.mockImplementationOnce(async (_opts, cb) => {
    emit = (latitude, longitude, accuracy = 5) => cb({ coords: { latitude, longitude, accuracy } } as never);
    return { remove };
  });
  return { emit: (...a: Parameters<typeof emit>) => emit(...a), remove };
}

beforeEach(() => {
  useWalk.getState().reset();
  jest.useFakeTimers().setSystemTime(new Date('2026-11-17T18:00:00Z'));
});
afterEach(() => jest.useRealTimers());

describe('walk store com GPS real', () => {
  it('desenha a rota filtrando pontos imprecisos e passos curtos demais', async () => {
    const gps = captureGps();
    let onSteps: (r: { steps: number }) => void = () => undefined;
    jest.mocked(Pedometer.watchStepCount).mockImplementationOnce((cb) => {
      onSteps = cb as never;
      return { remove: jest.fn() };
    });

    await useWalk.getState().start({ petId: 1, demo: false, temperature: 24 });
    expect(useWalk.getState()).toMatchObject({ status: 'running', petId: 1, gpsReady: false, temperature: 24 });

    gps.emit(-23.5, -46.6);
    gps.emit(-23.6, -46.7, 80); // impreciso: ignorado
    gps.emit(-23.50001, -46.6); // ~1 m: ignorado
    gps.emit(-23.5, -46.601); // ~100 m
    onSteps({ steps: 120 });

    const s = useWalk.getState();
    expect(s.gpsReady).toBe(true);
    expect(s.points).toHaveLength(2);
    expect(Math.round(s.distance)).toBe(102);
    expect(s.steps).toBe(120);
  });

  it('parado, o tremido do GPS dentro da margem de erro não vira trajeto', async () => {
    const gps = captureGps();
    await useWalk.getState().start({ petId: 1, demo: false, temperature: null });
    gps.emit(-23.5, -46.6, 20);
    gps.emit(-23.50012, -46.6, 20); // ~13 m, mas a leitura erra até 20 m: ignorado
    gps.emit(-23.5, -46.60014, 18); // ~14 m: ignorado
    expect(useWalk.getState().points).toHaveLength(1);
    expect(useWalk.getState().distance).toBe(0);

    gps.emit(-23.5003, -46.6, 20); // ~33 m: andou de verdade
    expect(useWalk.getState().points).toHaveLength(2);
  });

  it('ignora leituras sem precisão informada', async () => {
    const gps = captureGps();
    await useWalk.getState().start({ petId: 1, demo: false, temperature: null });
    gps.emit(-23.5, -46.6, undefined as never);
    expect(useWalk.getState().points).toHaveLength(1);
    // accuracy nula vira 99 → ignorada
    jest.mocked(watchPosition).mock.calls[0][1]({ coords: { latitude: 1, longitude: 1, accuracy: null } } as never);
    expect(useWalk.getState().points).toHaveLength(1);
  });

  it('funciona sem pedômetro ou sem permissão dele', async () => {
    jest.mocked(Pedometer.isAvailableAsync).mockResolvedValueOnce(false);
    await useWalk.getState().start({ petId: 1, demo: false, temperature: null });
    expect(Pedometer.watchStepCount).not.toHaveBeenCalled();

    jest.mocked(Pedometer.isAvailableAsync).mockRejectedValueOnce(new Error('x'));
    await useWalk.getState().start({ petId: 1, demo: false, temperature: null });

    jest.mocked(Pedometer.requestPermissionsAsync).mockResolvedValueOnce({ granted: false } as never);
    await useWalk.getState().start({ petId: 1, demo: false, temperature: null });

    jest.mocked(Pedometer.requestPermissionsAsync).mockRejectedValueOnce(new Error('x'));
    await useWalk.getState().start({ petId: 1, demo: false, temperature: null });
    expect(Pedometer.watchStepCount).not.toHaveBeenCalled();
  });

  it('pausa, retoma somando o tempo e continua contando passos de onde parou', async () => {
    const steps: Array<(r: { steps: number }) => void> = [];
    jest.mocked(Pedometer.watchStepCount).mockImplementation((cb) => {
      steps.push(cb as never);
      return { remove: jest.fn() };
    });
    await useWalk.getState().start({ petId: 1, demo: false, temperature: null });
    steps[0]({ steps: 50 });
    jest.advanceTimersByTime(60_000);
    useWalk.getState().pause();
    expect(useWalk.getState()).toMatchObject({ status: 'paused', accumulatedMs: 60_000, resumedAt: null });

    jest.advanceTimersByTime(30_000); // tempo pausado não conta
    await useWalk.getState().resume();
    steps[1]({ steps: 10 });
    jest.advanceTimersByTime(15_000);
    expect(elapsedMs(useWalk.getState())).toBe(75_000);
    expect(useWalk.getState().steps).toBe(60);
    jest.mocked(Pedometer.watchStepCount).mockReset();
  });

  it('marca eventos só depois do primeiro ponto de GPS', async () => {
    const gps = captureGps();
    await useWalk.getState().start({ petId: 1, demo: false, temperature: null });
    expect(useWalk.getState().addEvent('pee')).toBe(false);
    gps.emit(-23.5, -46.6);
    expect(useWalk.getState().addEvent('water')).toBe(true);
    expect(useWalk.getState().events[0]).toMatchObject({ type: 'water', lat: -23.5, lng: -46.6 });
  });

  it('finaliza devolvendo o payload e parando os sensores', async () => {
    const gps = captureGps();
    await useWalk.getState().start({ petId: 3, demo: false, temperature: 20 });
    gps.emit(-23.5, -46.6);
    gps.emit(-23.5, -46.601);
    jest.advanceTimersByTime(90_400);

    const payload = useWalk.getState().finish()!;
    expect(payload).toMatchObject({ pet_id: 3, duration_seconds: 90, distance_meters: 102, temperature_c: 20 });
    expect(payload.points).toHaveLength(2);
    expect(gps.remove).toHaveBeenCalled();
    expect(useWalk.getState().status).toBe('paused');
  });

  it('finish sem passeio iniciado devolve null e a duração mínima é 1s', async () => {
    expect(useWalk.getState().finish()).toBeNull();
    await useWalk.getState().start({ petId: 1, demo: false, temperature: null });
    expect(useWalk.getState().finish()!.duration_seconds).toBe(1);
  });
});

describe('walk store no modo apresentação', () => {
  it('simula o passeio a partir da posição atual', async () => {
    await useWalk.getState().start({ petId: 1, demo: true, temperature: null });
    expect(useWalk.getState().gpsReady).toBe(true);
    expect(Location.watchPositionAsync).not.toHaveBeenCalled();

    jest.advanceTimersByTime(5000);
    const s = useWalk.getState();
    expectNear(s.points[0], [-23.5, -46.6]);
    expect(s.points.length).toBeGreaterThan(1);
    expect(s.steps).toBeGreaterThanOrEqual(10);
  });

  it('usa a posição atual se não houver última conhecida, e um ponto padrão se tudo falhar', async () => {
    jest.mocked(Location.getLastKnownPositionAsync).mockResolvedValueOnce(null);
    await useWalk.getState().start({ petId: 1, demo: true, temperature: null });
    jest.advanceTimersByTime(1000);
    expectNear(useWalk.getState().points[0], [-23.5, -46.6]);
    expect(Location.getCurrentPositionAsync).toHaveBeenCalled();

    jest.mocked(Location.getLastKnownPositionAsync).mockRejectedValueOnce(new Error('sem gps'));
    await useWalk.getState().start({ petId: 1, demo: true, temperature: null });
    jest.advanceTimersByTime(1000);
    expectNear(useWalk.getState().points[0], [-23.5874, -46.6576]);
  });

  it('ao retomar, continua do primeiro ponto do passeio', async () => {
    await useWalk.getState().start({ petId: 1, demo: true, temperature: null });
    jest.advanceTimersByTime(3000);
    const first = useWalk.getState().points[0];
    useWalk.getState().pause();
    jest.mocked(Location.getLastKnownPositionAsync).mockClear();
    await useWalk.getState().resume();
    await flush();
    expect(Location.getLastKnownPositionAsync).not.toHaveBeenCalled();
    expect(useWalk.getState().points[0]).toEqual(first);
    useWalk.getState().reset();
  });
});
