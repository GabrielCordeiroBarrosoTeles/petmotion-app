import * as Haptics from 'expo-haptics';
import { Flag } from 'lucide-react-native';
import { act, fireEvent, renderWithTheme, screen } from '../../../test/render';
import { setAutoFinish, setReducedMotion } from '../../../test/motion';
import type { Achievement, Pet, Walk } from '@/services/types';
import { useWalk } from '@/store/walk';
import { AchievementBadge } from '../AchievementBadge';
import { BouncingBall } from '../BouncingBall';
import { Confetti } from '../Confetti';
import { Countdown } from '../Countdown';
import { HoldToConfirm } from '../HoldToConfirm';
import { MiniRoute } from '../MiniRoute';
import { PetAvatar } from '../PetAvatar';
import { PetSwitcher } from '../PetSwitcher';
import { ProgressRing } from '../ProgressRing';
import { RouteMap } from '../RouteMap';
import { TabBar } from '../TabBar';
import { WalkShareCard } from '../WalkShareCard';
import { WeatherBanner } from '../WeatherBanner';
import { WeekBars } from '../WeekBars';

const pet = (id: number, extra: Partial<Pet> = {}): Pet => ({
  id, name: `Pet${id}`, species: 'dog', breed: null, birth_date: null, weight_kg: null, daily_goal_minutes: 30, photo_url: null, role: 'owner', ...extra,
});

afterEach(() => {
  setReducedMotion(false);
  setAutoFinish(true);
});

describe('ProgressRing', () => {
  it('limita o progresso entre 0 e 100%', async () => {
    await renderWithTheme(<ProgressRing progress={1.7} size={100} />);
    expect(screen.getByRole('progressbar').props.accessibilityValue).toMatchObject({ now: 170 });
    await renderWithTheme(<ProgressRing progress={-1} size={100} stroke={4} color="#fff" track="#000" />);
  });
});

describe('PetAvatar', () => {
  it('foto, inicial de cachorro e de gato, com e sem aro', async () => {
    await renderWithTheme(<PetAvatar pet={pet(1, { photo_url: 'http://x/thor.jpg' })} size={40} ring />);
    expect(screen.getByLabelText('http://x/thor.jpg')).toBeOnTheScreen();
    await renderWithTheme(<PetAvatar pet={pet(2, { name: 'mel' })} size={40} />);
    expect(screen.getByText('M')).toBeOnTheScreen();
    await renderWithTheme(<PetAvatar pet={pet(3, { name: 'nina', species: 'cat' })} size={40} />);
    expect(screen.getByText('N')).toBeOnTheScreen();
  });
});

describe('PetSwitcher', () => {
  it('seleciona um pet e abre o cadastro', async () => {
    const onSelect = jest.fn();
    const onAdd = jest.fn();
    await renderWithTheme(<PetSwitcher pets={[pet(1), pet(2)]} selectedId={1} onSelect={onSelect} onAdd={onAdd} />);
    expect(screen.getByLabelText('Selecionar Pet1').props.accessibilityState).toEqual({ selected: true });
    await fireEvent.press(screen.getByLabelText('Selecionar Pet2'));
    await fireEvent.press(screen.getByLabelText('Adicionar pet'));
    expect(onSelect).toHaveBeenCalledWith(2);
    expect(onAdd).toHaveBeenCalled();
  });
});

describe('WeekBars', () => {
  it('destaca meta batida e hoje', async () => {
    const days = ['2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15', '2026-11-16', '2026-11-17'].map((date, i) => ({
      date,
      minutes: [0, 40, 10, 0, 0, 0, 5][i],
    }));
    await renderWithTheme(<WeekBars days={days} goal={30} />);
    expect(screen.getByText('hoje')).toBeOnTheScreen();
    expect(screen.getByText('qua')).toBeOnTheScreen();
    expect(screen.getByLabelText(/0, 40, 10/)).toBeOnTheScreen();
  });

  it('semana vazia sem meta não divide por zero', async () => {
    await renderWithTheme(<WeekBars days={[{ date: '2026-11-17', minutes: 0 }]} goal={0} />);
  });
});

describe('AchievementBadge', () => {
  const base: Achievement = { code: 'x', title: 'Embalado', description: '3 dias', icon: 'flame', progress: 1, unlocked: true };

  it.each(['footprints', 'flame', 'calendar-check', 'map', 'trophy', 'sunrise', 'moon', 'heart', 'desconhecido'])(
    'desbloqueada com ícone %s',
    async (icon) => {
      const onPress = jest.fn();
      await renderWithTheme(<AchievementBadge achievement={{ ...base, icon }} index={0} onPress={onPress} />);
      await fireEvent.press(screen.getByLabelText(/Conquistada/));
      expect(onPress).toHaveBeenCalledWith(expect.objectContaining({ icon }));
    },
  );

  it('bloqueada mostra cadeado e progresso; sem onPress não quebra', async () => {
    await renderWithTheme(<AchievementBadge achievement={{ ...base, unlocked: false, progress: 0.4 }} index={2} />);
    expect(screen.getByText('icon:Lock')).toBeOnTheScreen();
    await fireEvent.press(screen.getByLabelText(/40%/));
  });
});

describe('Confetti', () => {
  it('só aparece com uma explosão e sem "reduzir movimento"', async () => {
    const { rerender } = await renderWithTheme(<Confetti burstKey={0} />);
    expect(screen.toJSON()).toBeNull();
    await rerender(<Confetti burstKey={1} count={6} />);
    expect(screen.toJSON()).not.toBeNull();
    setReducedMotion(true);
    await rerender(<Confetti burstKey={2} />);
    expect(screen.toJSON()).toBeNull();
  });
});

describe('WeatherBanner', () => {
  it.each([
    ['safe', 'Chão tranquilo para as patas'],
    ['warning', 'Chão morno, atenção'],
    ['danger', 'Asfalto quente demais'],
  ] as const)('nível %s', async (level, title) => {
    await renderWithTheme(<WeatherBanner weather={{ air_c: 21.6, asphalt_c: 47, is_day: true, uv_index: 1, level, message: 'msg' }} />);
    expect(screen.getByText(title)).toBeOnTheScreen();
    expect(screen.getByText('47°')).toBeOnTheScreen();
  });
});

describe('BouncingBall', () => {
  it('quica ou fica parada com "reduzir movimento"', async () => {
    await renderWithTheme(<BouncingBall size={40} />);
    setReducedMotion(true);
    await renderWithTheme(<BouncingBall size={40} />);
  });
});

describe('Countdown', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('conta 3-2-1-Vai! com vibração e termina', async () => {
    const onDone = jest.fn();
    const { rerender } = await renderWithTheme(<Countdown active={false} onDone={onDone} />);
    expect(screen.toJSON()).toBeNull();

    await rerender(<Countdown active onDone={onDone} />);
    expect(screen.getByText('3')).toBeOnTheScreen();
    await act(() => jest.advanceTimersByTime(750));
    expect(screen.getByText('2')).toBeOnTheScreen();
    await act(() => jest.advanceTimersByTime(750));
    expect(screen.getByText('1')).toBeOnTheScreen();
    await act(() => jest.advanceTimersByTime(750));
    expect(screen.getByText('Vai!')).toBeOnTheScreen();
    await act(() => jest.advanceTimersByTime(450));
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(4);

    await rerender(<Countdown active={false} onDone={onDone} />);
    expect(screen.toJSON()).toBeNull();
  });
});

describe('HoldToConfirm', () => {
  it('confirma ao completar o tempo segurando', async () => {
    const onConfirm = jest.fn();
    await renderWithTheme(<HoldToConfirm label="Segure" icon={Flag} onConfirm={onConfirm} />);
    await fireEvent(screen.getByLabelText('Segure'), 'pressIn');
    expect(onConfirm).toHaveBeenCalled();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
    await fireEvent(screen.getByLabelText('Segure'), 'pressOut'); // já completo: nada a desfazer
  });

  it('soltar antes mostra o texto de segurar e desfaz', async () => {
    setAutoFinish(false);
    const onConfirm = jest.fn();
    await renderWithTheme(<HoldToConfirm label="Segure" holdingLabel="Quase…" onConfirm={onConfirm} />);
    await fireEvent(screen.getByLabelText('Segure'), 'pressIn');
    expect(screen.getByText('Quase…')).toBeOnTheScreen();
    await fireEvent(screen.getByLabelText('Segure'), 'pressOut');
    expect(screen.getByText('Segure')).toBeOnTheScreen();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('leitor de tela confirma pela ação de acessibilidade', async () => {
    const onConfirm = jest.fn();
    await renderWithTheme(<HoldToConfirm label="Segure" onConfirm={onConfirm} />);
    await fireEvent(screen.getByLabelText('Segure'), 'accessibilityAction');
    expect(onConfirm).toHaveBeenCalled();
  });
});

const walk: Walk = {
  id: 1, pet_id: 1, started_at: '2026-11-17T18:00:00', ended_at: '2026-11-17T18:40:00', duration_seconds: 2460,
  distance_meters: 3420, steps: 4617, temperature_c: 22, points: [[0, 0], [0.001, 0.002], [0.002, 0.001]], events: [],
};

describe('MiniRoute', () => {
  it('desenha a rota, animada ou não, e nada com menos de 2 pontos', async () => {
    await renderWithTheme(<MiniRoute points={walk.points} width={100} height={60} animated color="#fff" />);
    await renderWithTheme(<MiniRoute points={walk.points} width={100} height={60} />);
    await renderWithTheme(<MiniRoute points={[[0, 0]]} width={100} height={60} />);
  });
});

describe('WalkShareCard', () => {
  it('mostra os números e desenha a rota depois de medir a largura', async () => {
    await renderWithTheme(<WalkShareCard walk={walk} pet={pet(1, { name: 'Thor' })} animated />);
    expect(screen.getByText('Passeio do Thor')).toBeOnTheScreen();
    expect(screen.getByText('3,42')).toBeOnTheScreen();
    expect(screen.getByText('41 min')).toBeOnTheScreen();
    expect(screen.getByText('4.617')).toBeOnTheScreen();
    const routeBox = screen.getByText('Passeio do Thor').parent!.parent!.parent!.children[1] as never;
    await fireEvent(routeBox, 'layout', { nativeEvent: { layout: { width: 300 } } });
  });

  it('com map, mostra o mapa de verdade (estático) no lugar do desenho', async () => {
    await renderWithTheme(<WalkShareCard walk={walk} pet={pet(1, { name: 'Thor' })} map />);
    const map = screen.getByTestId('map');
    expect(map.props.dragPan).toBe(false); // parado: é para virar imagem no compartilhamento
    expect(map.props.attribution).toBe(false);
  });
});

describe('RouteMap', () => {
  const events = [
    { type: 'pee' as const, lat: 0, lng: 0, occurred_at: 'a' },
    { type: 'poop' as const, lat: 0, lng: 0, occurred_at: 'b' },
    { type: 'water' as const, lat: 0, lng: 0, occurred_at: 'c' },
  ];

  it('rota completa: enquadra os pontos, desenha contorno + traço e mostra marcações', async () => {
    await renderWithTheme(<RouteMap points={walk.points} events={events} interactive={false} />);
    const view = screen.getByTestId('camera').props.initialViewState;
    expect(view.bounds).toHaveLength(4);
    expect(view.padding).toEqual({ top: 40, right: 40, bottom: 40, left: 40 });
    expect(screen.getAllByTestId('layer')).toHaveLength(2);
    expect(screen.getByTestId('route-source').props.data.geometry.coordinates).toHaveLength(walk.points.length);
    expect(screen.getAllByTestId('marker')).toHaveLength(4); // início + 3 eventos
    expect(screen.getByTestId('map').props.dragPan).toBe(false);
  });

  it('respeita a margem informada; mexível quando interativo', async () => {
    await renderWithTheme(<RouteMap points={walk.points} edgePadding={{ top: 1, right: 2, bottom: 3, left: 4 }} />);
    expect(screen.getByTestId('camera').props.initialViewState.padding).toEqual({ top: 1, right: 2, bottom: 3, left: 4 });
    expect(screen.getByTestId('map').props.dragPan).toBe(true);
  });

  it('ao vivo segue o último ponto e mostra a posição atual', async () => {
    await renderWithTheme(<RouteMap points={walk.points} follow />);
    const last = walk.points[walk.points.length - 1];
    expect(screen.getByTestId('camera').props.center).toEqual([last[1], last[0]]);
    expect(screen.getAllByTestId('marker')).toHaveLength(2); // início + eu
  });

  it('um ponto só: centraliza nele, sem rota', async () => {
    await renderWithTheme(<RouteMap points={[[-23.5, -46.6]]} />);
    expect(screen.getByTestId('camera').props.initialViewState).toEqual({ center: [-46.6, -23.5], zoom: 15 });
    expect(screen.queryByTestId('route-source')).toBeNull();
  });

  it('sem pontos não desenha nada', async () => {
    await renderWithTheme(<RouteMap points={[]} follow />);
    expect(screen.queryByTestId('route-source')).toBeNull();
    expect(screen.queryByTestId('marker')).toBeNull();
    // sem posição ainda: abre no centro padrão em vez de seguir
    expect(screen.getByTestId('camera').props.initialViewState).toEqual({ center: [-46.6576, -23.5874], zoom: 15 });
  });
});

describe('TabBar', () => {
  const routes = ['home', 'history', 'health', 'profile'].map((name) => ({ key: `${name}-key`, name }));
  const props = (index: number, prevent = false) => ({
    state: { index, routes } as never,
    emitter: { emit: jest.fn(() => ({ defaultPrevented: prevent })) } as never,
    navigateToTab: jest.fn(),
    descriptors: {} as never,
    insets: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  afterEach(() => useWalk.getState().reset());

  it('navega para outra aba com vibração e mede a barra', async () => {
    const p = props(0);
    await renderWithTheme(<TabBar {...p} />);
    await fireEvent(screen.getByLabelText('Início').parent!, 'layout', { nativeEvent: { layout: { width: 360 } } });
    await fireEvent.press(screen.getByLabelText('Passeios'));
    expect(p.navigateToTab).toHaveBeenCalledWith('history-key');
    expect(Haptics.selectionAsync).toHaveBeenCalled();

    await fireEvent.press(screen.getByLabelText('Início')); // aba atual: não navega
    expect(p.navigateToTab).toHaveBeenCalledTimes(1);
  });

  it('respeita quem cancela o tabPress', async () => {
    const p = props(0, true);
    await renderWithTheme(<TabBar {...p} />);
    await fireEvent.press(screen.getByLabelText('Saúde'));
    expect(p.navigateToTab).not.toHaveBeenCalled();
  });

  it('botão central abre o passeio e mostra o timer enquanto passeia', async () => {
    await renderWithTheme(<TabBar {...props(3)} />);
    await fireEvent.press(screen.getByLabelText('Começar passeio'));
    expect(global.__router.push).toHaveBeenCalledWith('/walk');
    expect(Haptics.impactAsync).toHaveBeenCalledWith('heavy');

    await act(() => useWalk.setState({ status: 'paused', accumulatedMs: 65_000, resumedAt: null }));
    expect(screen.getByLabelText('Voltar ao passeio em andamento')).toBeOnTheScreen();
    expect(screen.getByText('01:05')).toBeOnTheScreen();
  });

  it('sem animação de pulso com "reduzir movimento" e ignora rotas desconhecidas', async () => {
    setReducedMotion(true);
    await renderWithTheme(<TabBar {...props(0)} state={{ index: 0, routes: [{ key: 'x', name: 'outra' }] } as never} />);
    expect(screen.queryByLabelText('Início')).toBeNull();
  });
});
