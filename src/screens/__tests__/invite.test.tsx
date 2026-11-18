import { useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams } from 'expo-router';
import { act, fireEvent, renderWithTheme, screen, waitFor } from '../../../test/render';
import { makePet } from '../../../test/fixtures';
import * as apiModule from '@/services/api';
import { usePets } from '@/store/pets';
import { useToastStore } from '@/store/toast';
import { InviteScreen } from '../Invite';
import { ScanInviteScreen } from '../ScanInvite';

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  api: { invite: jest.fn(), acceptInvite: jest.fn(), pets: jest.fn() },
}));
const { api } = jest.mocked(apiModule);
const resetApi = () => Object.values(api).forEach((fn) => (fn as jest.Mock).mockReset());
beforeEach(resetApi);

const preview = {
  code: 'K7M2QX9A', expires_at: '2026-11-20T12:00:00',
  pet: { id: 9, name: 'Thor', species: 'dog' as const, photo_url: null }, owner: { name: 'Ana' },
};
const httpError = (status: number, data: object) =>
  Object.assign(new Error('x'), { isAxiosError: true, response: { status, data } });

beforeEach(() => {
  usePets.setState({ pets: [makePet({ id: 1, name: 'Mel' })], selectedId: 1, loaded: true });
  jest.mocked(useLocalSearchParams).mockReturnValue({ code: 'K7M2QX9A' });
});

describe('Convite', () => {
  it('mostra a prévia e aceita: toast, recarrega os pets, seleciona o novo e vai para o início', async () => {
    let release: (p: typeof preview) => void = () => undefined;
    api.invite.mockReturnValueOnce(new Promise((resolve) => { release = resolve; }));
    api.acceptInvite.mockResolvedValueOnce(makePet({ id: 9, name: 'Thor', role: 'walker' }));
    api.pets.mockResolvedValueOnce([makePet({ id: 1, name: 'Mel' }), makePet({ id: 9, name: 'Thor', role: 'walker' })]);
    await renderWithTheme(<InviteScreen />);
    expect(screen.getByLabelText('Carregando convite')).toBeOnTheScreen();
    await act(async () => release(preview));
    expect(await screen.findByText('Ana quer que você passeie com o Thor')).toBeOnTheScreen();
    expect(api.invite).toHaveBeenCalledWith('K7M2QX9A');
    await fireEvent.press(screen.getByRole('button', { name: 'Aceitar e passear' }));
    await waitFor(() => expect(global.__router.replace).toHaveBeenCalledWith('/home'));
    expect(api.acceptInvite).toHaveBeenCalledWith('K7M2QX9A');
    expect(useToastStore.getState().current).toMatchObject({ type: 'success', message: 'Pronto! Agora você passeia com o Thor.' });
    expect(usePets.getState().pets.map((p) => p.id)).toEqual([1, 9]);
    expect(usePets.getState().selectedId).toBe(9);
  });

  it('falha ao aceitar vira aviso e continua na prévia', async () => {
    api.invite.mockResolvedValueOnce(preview);
    api.acceptInvite.mockRejectedValueOnce(new Error('x'));
    await renderWithTheme(<InviteScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Aceitar e passear' }));
    await waitFor(() => expect(useToastStore.getState().current?.type).toBe('danger'));
    expect(global.__router.replace).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Aceitar e passear' })).toBeOnTheScreen();
  });

  it('"Agora não" volta', async () => {
    api.invite.mockResolvedValueOnce(preview);
    await renderWithTheme(<InviteScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Agora não' }));
    expect(global.__router.back).toHaveBeenCalled();
  });

  it('código minúsculo na rota vai para a API em maiúsculas', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ code: 'k7m2qx9a' });
    api.invite.mockResolvedValueOnce(preview);
    api.acceptInvite.mockResolvedValueOnce(makePet({ id: 9, name: 'Thor', role: 'walker' }));
    api.pets.mockResolvedValueOnce([makePet({ id: 9, name: 'Thor', role: 'walker' })]);
    await renderWithTheme(<InviteScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Aceitar e passear' }));
    expect(api.invite).toHaveBeenCalledWith('K7M2QX9A');
    await waitFor(() => expect(api.acceptInvite).toHaveBeenCalledWith('K7M2QX9A'));
  });

  it('código lixo na rota mostra o estado inválido sem chamar a API', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ code: 'lixo!' });
    await renderWithTheme(<InviteScreen />);
    expect(await screen.findByText('Esse convite não vale mais')).toBeOnTheScreen();
    expect(api.invite).not.toHaveBeenCalled();
    jest.mocked(useLocalSearchParams).mockReturnValue({});
    await renderWithTheme(<InviteScreen />);
    expect(api.invite).not.toHaveBeenCalled();
  });

  it('resposta atrasada de um código antigo não sobrescreve o novo', async () => {
    let releaseOld: (p: typeof preview) => void = () => undefined;
    api.invite.mockReturnValueOnce(new Promise((resolve) => { releaseOld = resolve; }));
    api.invite.mockResolvedValueOnce({ ...preview, owner: { name: 'Bia' } });
    const { rerender } = await renderWithTheme(<InviteScreen />);
    jest.mocked(useLocalSearchParams).mockReturnValue({ code: 'ZZZZZZZZ' });
    await rerender(<InviteScreen />);
    expect(await screen.findByText('Bia quer que você passeie com o Thor')).toBeOnTheScreen();
    await act(async () => releaseOld(preview));
    expect(screen.queryByText(/^Ana quer/)).toBeNull();
    expect(screen.getByText('Bia quer que você passeie com o Thor')).toBeOnTheScreen();
  });

  it('convite inválido mostra "Esse convite não vale mais"', async () => {
    api.invite.mockRejectedValueOnce(httpError(404, { message: 'Not found' }));
    await renderWithTheme(<InviteScreen />);
    expect(await screen.findByText('Esse convite não vale mais')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Fechar' }));
    expect(global.__router.back).toHaveBeenCalled();
  });

  it('pet do próprio usuário mostra "Esse pet já é seu"', async () => {
    api.invite.mockRejectedValueOnce(httpError(422, { error: 'own_pet' }));
    await renderWithTheme(<InviteScreen />);
    expect(await screen.findByText('Esse pet já é seu')).toBeOnTheScreen();
  });
});

describe('Ler convite', () => {
  const scan = async (data: string) => {
    await act(() => screen.getByTestId('camera-view').props.onBarcodeScanned({ data }));
  };

  it('QR válido abre o convite', async () => {
    await renderWithTheme(<ScanInviteScreen />);
    expect(screen.getByTestId('camera-view').props.barcodeScannerSettings).toEqual({ barcodeTypes: ['qr'] });
    await scan('https://petmotion.tolembrado.com.br/convite/k7m2qx9a');
    expect(global.__router.replace).toHaveBeenCalledWith('/convite/K7M2QX9A');
  });

  it('QR inválido avisa uma vez só e continua lendo; depois um válido funciona', async () => {
    await renderWithTheme(<ScanInviteScreen />);
    await scan('https://google.com');
    expect(useToastStore.getState().current?.type).toBe('warning');
    const first = useToastStore.getState().current;
    await scan('https://google.com');
    expect(useToastStore.getState().current).toBe(first);
    expect(global.__router.replace).not.toHaveBeenCalled();
    await scan('petmotion://convite/K7M2QX9A');
    expect(global.__router.replace).toHaveBeenCalledWith('/convite/K7M2QX9A');
  });

  it('só navega uma vez mesmo se a câmera ler o mesmo QR várias vezes', async () => {
    await renderWithTheme(<ScanInviteScreen />);
    await scan('K7M2QX9A');
    await scan('K7M2QX9A');
    expect(global.__router.replace).toHaveBeenCalledTimes(1);
  });

  it('sem permissão mostra "Permitir câmera" e pede a permissão', async () => {
    const request = jest.fn();
    jest.mocked(useCameraPermissions).mockReturnValueOnce([{ granted: false }, request] as never);
    await renderWithTheme(<ScanInviteScreen />);
    expect(screen.queryByTestId('camera-view')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Permitir câmera' }));
    expect(request).toHaveBeenCalled();
  });

  it('enquanto a permissão carrega não mostra nada e o voltar funciona', async () => {
    jest.mocked(useCameraPermissions).mockReturnValueOnce([null, jest.fn()] as never);
    await renderWithTheme(<ScanInviteScreen />);
    expect(screen.queryByTestId('camera-view')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Permitir câmera' })).toBeNull();
    await fireEvent.press(screen.getByLabelText('Voltar'));
    expect(global.__router.back).toHaveBeenCalled();
  });
});
