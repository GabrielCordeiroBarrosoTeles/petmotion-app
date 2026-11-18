import * as Haptics from 'expo-haptics';
import { act, renderWithTheme, screen } from '../../../test/render';
import { setReducedMotion } from '../../../test/motion';
import { SplashIntro, bezier } from '../SplashIntro';

const animateOf = (testID: string) => screen.getByTestId(testID).props.testOnly_animate;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
  setReducedMotion(false);
});

describe('bezier', () => {
  const curve = [{ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 10, y: 10 }, { x: 10, y: 0 }];
  it('começa no primeiro ponto, termina no último e passa pelo meio da curva', () => {
    expect(bezier(curve, 0)).toEqual({ x: 0, y: 0 });
    expect(bezier(curve, 1)).toEqual({ x: 10, y: 0 });
    expect(bezier(curve, 0.5)).toEqual({ x: 5, y: 7.5 });
  });
});

describe('SplashIntro', () => {
  it('mostra a marca, vibra quando a bola pousa e espera o app ficar pronto para sair', async () => {
    const onFinish = jest.fn();
    await renderWithTheme(<SplashIntro ready={false} onFinish={onFinish} />);
    expect(screen.getByLabelText('PetMotion. Cada passeio vira um mapa.')).toBeOnTheScreen();
    expect(screen.getByText('Cada passeio vira um mapa.', { includeHiddenElements: true })).toBeOnTheScreen();

    await act(() => jest.advanceTimersByTime(1300));
    expect(Haptics.impactAsync).toHaveBeenCalled();

    // abertura terminou, mas o app ainda carrega: a splash fica
    await act(() => jest.advanceTimersByTime(5000));
    expect(animateOf('splash')).toEqual({ opacity: 1 });
    expect(onFinish).not.toHaveBeenCalled();

    await screen.rerender(<SplashIntro ready onFinish={onFinish} />);
    expect(animateOf('splash')).toEqual({ opacity: 0 });
    await act(() => jest.advanceTimersByTime(760));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('app pronto antes do fim da abertura: só sai quando a abertura acaba', async () => {
    const onFinish = jest.fn();
    await renderWithTheme(<SplashIntro ready onFinish={onFinish} />);
    await act(() => jest.advanceTimersByTime(1800));
    expect(animateOf('splash')).toEqual({ opacity: 1 });
    await act(() => jest.advanceTimersByTime(100));
    await act(() => jest.advanceTimersByTime(760));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('com "reduzir movimento" pula a abertura e só esmaece', async () => {
    setReducedMotion(true);
    const onFinish = jest.fn();
    await renderWithTheme(<SplashIntro ready onFinish={onFinish} />);
    expect(animateOf('splash')).toEqual({ opacity: 0 });
    await act(() => jest.advanceTimersByTime(260));
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });

  it('desmontada no meio da abertura não chama nada depois', async () => {
    const onFinish = jest.fn();
    await renderWithTheme(<SplashIntro ready onFinish={onFinish} />);
    await screen.unmount();
    await act(() => jest.advanceTimersByTime(5000));
    expect(onFinish).not.toHaveBeenCalled();
  });
});
