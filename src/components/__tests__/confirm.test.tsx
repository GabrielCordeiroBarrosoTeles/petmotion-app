import * as Haptics from 'expo-haptics';
import { Trash2 } from 'lucide-react-native';
import { act, fireEvent, renderWithTheme, screen } from '../../../test/render';
import { setReducedMotion } from '../../../test/motion';
import { useConfirmStore } from '@/store/confirm';
import { confirmAction } from '@/utils/confirm';
import { ConfirmHost } from '../ConfirmSheet';

const base = { title: 'Excluir passeio?', message: 'Some para sempre.', confirmLabel: 'Excluir', icon: Trash2 };

beforeEach(() => {
  jest.clearAllMocks();
  useConfirmStore.setState({ current: null, resolve: null });
});
afterEach(() => setReducedMotion(false));

describe('ConfirmHost + confirmAction', () => {
  it('fechado não desenha nada', async () => {
    await renderWithTheme(<ConfirmHost />);
    expect(screen.toJSON()).toBeNull();
  });

  it('ação destrutiva: vibra de alerta, mostra o selo e resolve true ao confirmar', async () => {
    await renderWithTheme(<ConfirmHost />);
    let answer: Promise<boolean> = Promise.resolve(false);
    await act(async () => {
      answer = confirmAction(base);
    });
    expect(Haptics.notificationAsync).toHaveBeenCalled();
    expect(screen.getByRole('header', { name: 'Excluir passeio?' })).toBeOnTheScreen();
    expect(screen.getByText('Some para sempre.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir' }));
    await expect(answer).resolves.toBe(true);
    expect(screen.queryByText('Some para sempre.')).toBeNull();
  });

  it('confirmação comum não vibra; tocar fora, Cancelar ou voltar resolvem false', async () => {
    setReducedMotion(true);
    await renderWithTheme(<ConfirmHost />);
    // devolve a promise embrulhada: uma função async que devolve a promise esperaria a resposta
    const ask = async () => {
      const box: { answer?: Promise<boolean> } = {};
      await act(async () => {
        box.answer = confirmAction({ ...base, tone: 'ink', cancelLabel: 'Agora não' });
      });
      return box;
    };

    let { answer } = await ask();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'Fechar' }));
    await expect(answer).resolves.toBe(false);

    ({ answer } = await ask());
    await fireEvent.press(screen.getByRole('button', { name: 'Agora não' }));
    await expect(answer).resolves.toBe(false);

    ({ answer } = await ask());
    await fireEvent(screen.getByTestId('confirm-modal'), 'requestClose');
    await expect(answer).resolves.toBe(false);
  });

  it('celular sem vibração não impede a pergunta', async () => {
    jest.mocked(Haptics.notificationAsync).mockRejectedValueOnce(new Error('sem motor'));
    const answer = confirmAction(base);
    expect(useConfirmStore.getState().current?.title).toBe('Excluir passeio?');
    useConfirmStore.getState().answer(true);
    await expect(answer).resolves.toBe(true);
  });

  it('uma pergunta nova cancela a anterior', async () => {
    const first = confirmAction(base);
    const second = confirmAction({ ...base, title: 'Outra?' });
    await expect(first).resolves.toBe(false);
    expect(useConfirmStore.getState().current?.title).toBe('Outra?');
    useConfirmStore.getState().answer(true);
    await expect(second).resolves.toBe(true);
  });
});
