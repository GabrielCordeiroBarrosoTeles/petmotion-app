import { Share } from 'react-native';
import { act, answerConfirm, fireEvent, renderWithTheme, screen, waitFor } from '../../../test/render';
import { makePet } from '../../../test/fixtures';
import { setReducedMotion } from '../../../test/motion';
import * as apiModule from '@/services/api';
import { useToastStore } from '@/store/toast';
import { InviteSheet } from '../InviteSheet';

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  api: { createInvite: jest.fn(), walkers: jest.fn(), removeWalker: jest.fn() },
}));
const { api } = jest.mocked(apiModule);
const resetApi = () => Object.values(api).forEach((fn) => (fn as jest.Mock).mockReset());
beforeEach(resetApi);

const invite = { code: 'K7M2QX9A', url: 'https://petmotion.tolembrado.com.br/convite/K7M2QX9A', expires_at: '2026-11-20T12:00:00' };
const pet = makePet();

describe('InviteSheet', () => {
  it('fechada não busca nada nem aparece', async () => {
    await renderWithTheme(<InviteSheet pet={pet} visible={false} onClose={jest.fn()} />);
    expect(screen.queryByTestId('invite-modal')).toBeNull();
    expect(api.createInvite).not.toHaveBeenCalled();
  });

  it('ao abrir cria o convite e mostra o QR com a URL e o código', async () => {
    api.createInvite.mockResolvedValueOnce(invite);
    api.walkers.mockResolvedValueOnce([]);
    await renderWithTheme(<InviteSheet pet={pet} visible onClose={jest.fn()} />);
    expect(await screen.findByText('K7M2 QX9A')).toBeOnTheScreen();
    expect(api.createInvite).toHaveBeenCalledWith(1);
    expect(screen.getByTestId('qr').props.accessibilityLabel).toBe(invite.url);
    expect(screen.getByText(/vale por 48 horas/)).toBeOnTheScreen();
    expect(screen.queryByText('Quem passeia com o Thor')).toBeNull();
  });

  it('"Enviar convite" abre o compartilhar com a mensagem e o link', async () => {
    api.createInvite.mockResolvedValueOnce(invite);
    api.walkers.mockResolvedValueOnce([]);
    const share = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction', activityType: undefined });
    await renderWithTheme(<InviteSheet pet={pet} visible onClose={jest.fn()} />);
    await screen.findByText('K7M2 QX9A');
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar convite' }));
    expect(share).toHaveBeenCalledWith({ message: `Oi! Quero que você passeie com o Thor no PetMotion. Abra: ${invite.url}` });
  });

  it('lista os passeadores e remove depois de confirmar', async () => {
    api.createInvite.mockResolvedValueOnce(invite);
    api.walkers.mockResolvedValueOnce([{ id: 7, name: 'Ana Lima' }, { id: 8, name: 'Lucas' }]);
    api.removeWalker.mockResolvedValueOnce({} as never);
    await renderWithTheme(<InviteSheet pet={pet} visible onClose={jest.fn()} />);
    expect(await screen.findByText('Ana Lima')).toBeOnTheScreen();
    await fireEvent.press(screen.getByLabelText('Remover Ana Lima'));
    await answerConfirm(true);
    expect(api.removeWalker).toHaveBeenCalledWith(1, 7);
    await waitFor(() => expect(screen.queryByText('Ana Lima')).toBeNull());
    expect(screen.getByText('Lucas')).toBeOnTheScreen();
    expect(useToastStore.getState().current?.type).toBe('success');
  });

  it('cancelar a confirmação mantém o passeador', async () => {
    api.createInvite.mockResolvedValueOnce(invite);
    api.walkers.mockResolvedValueOnce([{ id: 7, name: 'Ana Lima' }]);
    await renderWithTheme(<InviteSheet pet={pet} visible onClose={jest.fn()} />);
    await fireEvent.press(await screen.findByLabelText('Remover Ana Lima'));
    await answerConfirm(false);
    expect(api.removeWalker).not.toHaveBeenCalled();
    expect(screen.getByText('Ana Lima')).toBeOnTheScreen();
  });

  it('falha ao remover vira aviso e o passeador fica', async () => {
    api.createInvite.mockResolvedValueOnce(invite);
    api.walkers.mockResolvedValueOnce([{ id: 7, name: 'Ana Lima' }]);
    api.removeWalker.mockRejectedValueOnce(new Error('x'));
    await renderWithTheme(<InviteSheet pet={pet} visible onClose={jest.fn()} />);
    await fireEvent.press(await screen.findByLabelText('Remover Ana Lima'));
    await answerConfirm(true);
    expect(useToastStore.getState().current?.type).toBe('danger');
    expect(screen.getByText('Ana Lima')).toBeOnTheScreen();
  });

  it('falha ao criar o convite avisa e fecha a folha', async () => {
    api.createInvite.mockRejectedValueOnce(new Error('x'));
    api.walkers.mockResolvedValueOnce([]);
    const onClose = jest.fn();
    await renderWithTheme(<InviteSheet pet={pet} visible onClose={onClose} />);
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(useToastStore.getState().current?.type).toBe('danger');
  });

  it('sem movimento a folha já entra no lugar; falhas de rede nos extras não quebram', async () => {
    setReducedMotion(true);
    api.createInvite.mockResolvedValueOnce(invite);
    api.walkers.mockRejectedValueOnce(new Error('x'));
    jest.spyOn(Share, 'share').mockRejectedValueOnce(new Error('cancelou'));
    await renderWithTheme(<InviteSheet pet={pet} visible onClose={jest.fn()} />);
    await screen.findByText('K7M2 QX9A');
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar convite' }));
    expect(screen.queryByText(/Quem passeia/)).toBeNull();
    setReducedMotion(false);
  });

  it('fechar antes da resposta chegar não atualiza a folha', async () => {
    let release: (i: typeof invite) => void = () => undefined;
    api.createInvite.mockReturnValueOnce(new Promise((resolve) => { release = resolve; }));
    api.walkers.mockResolvedValueOnce([]);
    const { rerender } = await renderWithTheme(<InviteSheet pet={pet} visible onClose={jest.fn()} />);
    await rerender(<InviteSheet pet={pet} visible={false} onClose={jest.fn()} />);
    await act(async () => release(invite));
    expect(screen.queryByText('K7M2 QX9A')).toBeNull();
  });

  it('Fechar e o voltar do Android chamam onClose', async () => {
    api.createInvite.mockResolvedValueOnce(invite);
    api.walkers.mockResolvedValueOnce([]);
    const onClose = jest.fn();
    await renderWithTheme(<InviteSheet pet={pet} visible onClose={onClose} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Fechar' }));
    await fireEvent.press(screen.getByLabelText('Fechar convite'));
    screen.getByTestId('invite-modal').props.onRequestClose();
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
