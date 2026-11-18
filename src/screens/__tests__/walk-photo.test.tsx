import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { fireEvent, renderWithTheme, screen, waitFor } from '../../../test/render';
import { makeWalk, member, user } from '../../../test/fixtures';
import * as apiModule from '@/services/api';
import { useAuth } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import { WalkPhotoScreen } from '../WalkPhoto';
import { PhotoOverlay } from '../WalkPhoto/PhotoOverlay';

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  api: { walk: jest.fn() },
}));
const { api } = jest.mocked(apiModule);
// respostas "Once" não podem vazar de um teste para o outro
const resetApi = () => Object.values(api).forEach((fn) => (fn as jest.Mock).mockReset());
beforeEach(resetApi);

beforeEach(() => {
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: '10' });
  useAuth.setState({ status: 'signedIn', user });
});

describe('Foto do passeio', () => {
  it('sem foto convida a tirar ou escolher; com foto mostra estilos e compartilha', async () => {
    api.walk.mockResolvedValue(makeWalk());
    await renderWithTheme(<WalkPhotoScreen />);
    expect(await screen.findByText('Registre o momento')).toBeOnTheScreen();
    expect(screen.getByText(/Tire uma foto do Thor/)).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Compartilhar foto' })).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Câmera' }));
    expect(await screen.findByLabelText('file://camera.jpg')).toBeOnTheScreen();
    expect(screen.getByText('3,42 km')).toBeOnTheScreen(); // estilo "Números"

    await fireEvent.press(screen.getByLabelText('Trajeto'));
    await fireEvent.press(screen.getByLabelText('Faixa'));
    await fireEvent.press(screen.getByRole('button', { name: 'Compartilhar foto' }));
    await waitFor(() => expect(Sharing.shareAsync).toHaveBeenCalled());

    await fireEvent.press(screen.getByRole('button', { name: 'Galeria' }));
    expect(await screen.findByLabelText('file://gallery.jpg')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Outra foto' }));
  });

  it('cancelar a escolha mantém a tela; fechar volta', async () => {
    api.walk.mockResolvedValue(makeWalk());
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({ canceled: true } as never);
    await renderWithTheme(<WalkPhotoScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Galeria' }));
    expect(screen.getByText('Registre o momento')).toBeOnTheScreen();
    await fireEvent.press(screen.getByLabelText('Fechar'));
    expect(global.__router.back).toHaveBeenCalled();
  });

  it('passeio sem pet usa "seu pet"; erro ao carregar avisa e fica no skeleton', async () => {
    api.walk.mockResolvedValueOnce(makeWalk({ pet: undefined }));
    await renderWithTheme(<WalkPhotoScreen />);
    expect(await screen.findByText(/Tire uma foto do seu pet/)).toBeOnTheScreen();

    api.walk.mockRejectedValueOnce(new Error('404'));
    await renderWithTheme(<WalkPhotoScreen />);
    await waitFor(() => expect(useToastStore.getState().current?.type).toBe('danger'));
    expect(screen.getByLabelText('Carregando passeio')).toBeOnTheScreen();
  });

  it('membro da Matilha ganha o selo na foto', async () => {
    useAuth.setState({ user: member });
    api.walk.mockResolvedValue(makeWalk());
    await renderWithTheme(<WalkPhotoScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Câmera' }));
    expect(await screen.findByLabelText('Membro da Matilha')).toBeOnTheScreen();
  });
});

describe('PhotoOverlay', () => {
  it.each([
    ['stats', ['Distância', 'Tempo', 'Passos', 'Ritmo']],
    ['route', ['Distância', 'Tempo']],
    ['band', ['Distância', 'Tempo', 'Passos']],
  ] as const)('estilo %s mostra os números certos e a marca', async (layout, labels) => {
    await renderWithTheme(<PhotoOverlay walk={makeWalk()} petName="Thor" layout={layout} width={340} height={425} />);
    for (const label of labels) expect(screen.getByText(label)).toBeOnTheScreen();
    expect(screen.getByText('PetMotion · Thor')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Membro da Matilha')).toBeNull();
  });
});
