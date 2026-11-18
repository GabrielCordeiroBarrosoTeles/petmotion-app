import * as Haptics from 'expo-haptics';
import { Plus, Tag } from 'lucide-react-native';
import { Linking } from 'react-native';
import { act, fireEvent, renderWithTheme, screen } from '../../../test/render';
import { useToastStore } from '@/store/toast';
import { AnimatedCounter } from '../AnimatedCounter';
import { Button } from '../Button';
import { ChoiceChips } from '../ChoiceChips';
import { EmptyState } from '../EmptyState';
import { LegalLinks, PRIVACY_URL, TERMS_URL } from '../LegalLinks';
import { PressableScale } from '../PressableScale';
import { ScreenHeader } from '../ScreenHeader';
import { SegmentedControl } from '../SegmentedControl';
import { Skeleton } from '../Skeleton';
import { StatTile } from '../StatTile';
import { TextField } from '../TextField';
import { ToastHost } from '../ToastHost';

describe('PressableScale', () => {
  it.each([
    ['tap', 'impactAsync'],
    ['select', 'selectionAsync'],
  ] as const)('vibra com háptico %s e repassa os eventos', async (haptic, fn) => {
    const handlers = { onPress: jest.fn(), onPressIn: jest.fn(), onPressOut: jest.fn() };
    await renderWithTheme(<PressableScale haptic={haptic} accessibilityLabel="alvo" {...handlers}><Tag /></PressableScale>);
    const target = screen.getByLabelText('alvo');

    await fireEvent(target, 'pressIn');
    await fireEvent(target, 'pressOut');
    await fireEvent.press(target);

    expect(Haptics[fn]).toHaveBeenCalled();
    expect(handlers.onPressIn).toHaveBeenCalled();
    expect(handlers.onPressOut).toHaveBeenCalled();
    expect(handlers.onPress).toHaveBeenCalled();
  });

  it('sem háptico e sem handlers não quebra; respeita o papel informado', async () => {
    await renderWithTheme(<PressableScale haptic="none" accessibilityRole="link" accessibilityLabel="link"><Tag /></PressableScale>);
    const target = screen.getByRole('link');
    await fireEvent(target, 'pressIn');
    await fireEvent(target, 'pressOut');
    await fireEvent.press(target);
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });
});

describe('Button', () => {
  it.each(['primary', 'ink', 'ghost', 'danger'] as const)('variante %s', async (variant) => {
    await renderWithTheme(<Button title="Ok" variant={variant} compact={variant === 'ink'} onPress={jest.fn()} />);
    expect(screen.getByText('Ok')).toBeOnTheScreen();
  });

  it('carregando mostra spinner e fica desabilitado', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<Button title="Salvar" loading onPress={onPress} />);
    expect(screen.queryByText('Salvar')).toBeNull();
    await fireEvent.press(screen.getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByRole('button').props.accessibilityState).toMatchObject({ busy: true, disabled: true });
  });

  it('desabilitado não responde', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<Button title="Salvar" disabled icon={Plus} onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('TextField', () => {
  it('mostra label, ajuda e chama foco/blur', async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    await renderWithTheme(<TextField label="Nome" icon={Tag} helper="Como o pet se chama" onFocus={onFocus} onBlur={onBlur} />);
    const input = screen.getByLabelText('Nome');
    await fireEvent(input, 'focus');
    await fireEvent(input, 'blur');
    expect(onFocus).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalled();
    expect(screen.getByText('Como o pet se chama')).toBeOnTheScreen();
  });

  it('erro substitui a ajuda; foco sem handlers não quebra', async () => {
    await renderWithTheme(<TextField label="E-mail" icon={Tag} error="E-mail inválido" helper="ajuda" />);
    expect(screen.getByText('E-mail inválido')).toBeOnTheScreen();
    expect(screen.queryByText('ajuda')).toBeNull();
    await fireEvent(screen.getByLabelText('E-mail'), 'focus');
    await fireEvent(screen.getByLabelText('E-mail'), 'blur');
  });

  it('campo de senha mostra e esconde o texto', async () => {
    await renderWithTheme(<TextField label="Senha" secure />);
    expect(screen.getByLabelText('Senha').props.secureTextEntry).toBe(true);
    await fireEvent.press(screen.getByLabelText('Mostrar senha'));
    expect(screen.getByLabelText('Senha').props.secureTextEntry).toBe(false);
    expect(screen.getByLabelText('Esconder senha')).toBeOnTheScreen();
  });
});

describe('Skeleton', () => {
  it('aceita largura em número ou porcentagem', async () => {
    await renderWithTheme(<><Skeleton width={40} height={10} /><Skeleton height={10} delay={100} /></>);
  });
});

describe('ToastHost', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it.each([
    ['success', 'icon:CircleCheck'],
    ['warning', 'icon:TriangleAlert'],
    ['danger', 'icon:CircleAlert'],
  ] as const)('mostra o toast %s e esconde sozinho', async (type, icon) => {
    await renderWithTheme(<ToastHost />);
    await act(() => useToastStore.getState().show('Mensagem', type));
    expect(screen.getByText('Mensagem')).toBeOnTheScreen();
    expect(screen.getByText(icon)).toBeOnTheScreen();
    await act(() => jest.advanceTimersByTime(3200));
    expect(screen.queryByText('Mensagem')).toBeNull();
  });

  it('fecha ao tocar no X', async () => {
    await renderWithTheme(<ToastHost />);
    await act(() => useToastStore.getState().show('Fechar', 'success'));
    await fireEvent.press(screen.getByLabelText('Fechar aviso'));
    expect(useToastStore.getState().current).toBeNull();
  });
});

describe('AnimatedCounter', () => {
  it('sobe até o valor final e usa o formato', async () => {
    jest.useFakeTimers();
    await renderWithTheme(<AnimatedCounter value={100} variant="hero" onInk format={(n) => `${Math.round(n)} km`} />);
    await act(() => jest.advanceTimersByTime(1000));
    expect(screen.getByText('100 km')).toBeOnTheScreen();
    jest.useRealTimers();
  });

  it.each(['stat', 'inline'] as const)('variante %s com formato padrão', async (variant) => {
    jest.useFakeTimers();
    const view = await renderWithTheme(<AnimatedCounter value={7} variant={variant} />);
    await act(() => jest.advanceTimersByTime(1000));
    expect(screen.getByText('7')).toBeOnTheScreen();
    await view.unmount();
    jest.useRealTimers();
  });
});

describe('ChoiceChips', () => {
  it('marca o selecionado e devolve a escolha', async () => {
    const onPick = jest.fn();
    await renderWithTheme(<ChoiceChips options={['V10', 'Gripe']} selected="V10" onPick={onPick} />);
    expect(screen.getByLabelText('V10').props.accessibilityState).toEqual({ selected: true });
    await fireEvent.press(screen.getByLabelText('Gripe'));
    expect(onPick).toHaveBeenCalledWith('Gripe');
  });
});

describe('EmptyState', () => {
  it('com e sem botão de ação', async () => {
    const onAction = jest.fn();
    await renderWithTheme(<EmptyState icon={Tag} title="Nada" message="Vazio" actionLabel="Criar" onAction={onAction} />);
    await fireEvent.press(screen.getByText('Criar'));
    expect(onAction).toHaveBeenCalled();
    await renderWithTheme(<EmptyState icon={Tag} title="Só texto" message="Sem botão" />);
    expect(screen.queryByText('Criar')).toBeNull();
  });
});

describe('ScreenHeader', () => {
  it('voltar, subtítulo e ação', async () => {
    const onBack = jest.fn();
    const onPress = jest.fn();
    await renderWithTheme(<ScreenHeader title="Saúde" subtitle="Do Thor" onBack={onBack} action={{ icon: Plus, label: 'Adicionar', onPress }} />);
    await fireEvent.press(screen.getByLabelText('Voltar'));
    await fireEvent.press(screen.getByLabelText('Adicionar'));
    expect(onBack).toHaveBeenCalled();
    expect(onPress).toHaveBeenCalled();
    expect(screen.getByRole('header')).toHaveTextContent('Saúde');
  });

  it('só o título', async () => {
    await renderWithTheme(<ScreenHeader title="Perfil" />);
    expect(screen.queryByLabelText('Voltar')).toBeNull();
  });
});

describe('SegmentedControl', () => {
  it('mede, troca a opção e só vibra ao mudar', async () => {
    const onChange = jest.fn();
    await renderWithTheme(
      <SegmentedControl label="Espécie" value="dog" onChange={onChange} options={[{ value: 'dog', label: 'Cachorro', icon: Tag }, { value: 'cat', label: 'Gato' }]} />,
    );
    // o trilho (radiogroup) é o pai das opções
    await fireEvent(screen.getByLabelText('Cachorro').parent!, 'layout', { nativeEvent: { layout: { width: 300 } } });
    await fireEvent.press(screen.getByLabelText('Gato'));
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
    await fireEvent.press(screen.getByLabelText('Cachorro'));
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith('dog');
  });

  it('sem label e com valor desconhecido usa a primeira posição', async () => {
    await renderWithTheme(<SegmentedControl value={'x' as string} onChange={jest.fn()} options={[{ value: 'a', label: 'A' }]} />);
    expect(screen.getByLabelText('A').props.accessibilityState).toEqual({ checked: false });
  });
});

describe('StatTile', () => {
  it.each(['surface', 'sun', 'sky', 'blush', 'ink'] as const)('tom %s', async (tone) => {
    jest.useFakeTimers();
    await renderWithTheme(<StatTile icon={Tag} label="Passos" value={10} unit="km" tone={tone} />);
    await act(() => jest.advanceTimersByTime(1000));
    expect(screen.getByText('10')).toBeOnTheScreen();
    jest.useRealTimers();
  });

  it('tom padrão sem unidade', async () => {
    await renderWithTheme(<StatTile icon={Tag} label="Passeios" value={0} />);
    expect(screen.getByText('Passeios')).toBeOnTheScreen();
  });
});

describe('LegalLinks', () => {
  it('abre os Termos e a Privacidade no navegador', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    await renderWithTheme(<LegalLinks prefix="Leia os" />);
    await fireEvent.press(screen.getByText('Termos de uso'));
    await fireEvent.press(screen.getByText('Política de privacidade'));
    expect(open).toHaveBeenCalledWith(TERMS_URL);
    expect(open).toHaveBeenCalledWith(PRIVACY_URL);
    expect(TERMS_URL).toBe('http://192.168.0.10:8000/termos');
  });

  it('sem prefixo', async () => {
    await renderWithTheme(<LegalLinks />);
    expect(screen.getByText('Termos de uso')).toBeOnTheScreen();
  });
});
