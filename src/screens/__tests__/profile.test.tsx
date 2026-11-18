import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';
import { act, fireEvent, renderWithTheme, screen, waitFor } from '../../../test/render';
import { makePet, user } from '../../../test/fixtures';
import * as apiModule from '@/services/api';
import { useAuth } from '@/store/auth';
import { usePets } from '@/store/pets';
import { useSettings } from '@/store/settings';
import { useToastStore } from '@/store/toast';
import { PetFormScreen } from '../PetForm';
import { ProfileScreen } from '../Profile';

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  api: { createPet: jest.fn(), updatePet: jest.fn(), deletePet: jest.fn(), logout: jest.fn() },
}));
const { api } = jest.mocked(apiModule);
// respostas "Once" não podem vazar de um teste para o outro
const resetApi = () => Object.values(api).forEach((fn) => (fn as jest.Mock).mockReset());
beforeEach(resetApi);

beforeEach(() => {
  jest.useFakeTimers({ advanceTimers: true }).setSystemTime(new Date('2026-11-17T15:00:00'));
  useAuth.setState({ status: 'signedIn', user });
  usePets.setState({ pets: [makePet(), makePet({ id: 2, name: 'Mel', breed: null, birth_date: null, weight_kg: null, species: 'cat' })], selectedId: 1, loaded: true });
  useSettings.setState({ demoMode: false, walkReminder: false });
  jest.mocked(useLocalSearchParams).mockReturnValue({});
});
afterEach(() => jest.useRealTimers());

describe('Perfil', () => {
  it('mostra usuário, pets e abre edição e cadastro', async () => {
    await renderWithTheme(<ProfileScreen />);
    expect(screen.getByText('GC')).toBeOnTheScreen();
    expect(screen.getByText('Golden · 4 anos · 32,4 kg')).toBeOnTheScreen();
    expect(screen.getByText('Gato')).toBeOnTheScreen();
    await fireEvent.press(screen.getByLabelText('Editar Thor'));
    expect(global.__router.push).toHaveBeenCalledWith({ pathname: '/pet-form', params: { id: '1' } });
    await fireEvent.press(screen.getByRole('button', { name: 'Adicionar pet' }));
    expect(global.__router.push).toHaveBeenCalledWith('/pet-form');
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir minha conta' }));
    expect(global.__router.push).toHaveBeenCalledWith('/delete-account');
  });

  it('cachorro sem detalhes mostra a espécie; sem versão usa 1.0.0', async () => {
    const Constants = jest.requireMock('expo-constants').default;
    const original = Constants.expoConfig;
    Constants.expoConfig = undefined;
    usePets.setState({ pets: [makePet({ breed: null, birth_date: null, weight_kg: null })] });
    await renderWithTheme(<ProfileScreen />);
    expect(screen.getByText('Cachorro')).toBeOnTheScreen();
    expect(screen.getByText('PetMotion 1.0.0')).toBeOnTheScreen();
    Constants.expoConfig = original;
  });

  it('liga o modo apresentação e o lembrete diário', async () => {
    await renderWithTheme(<ProfileScreen />);
    await fireEvent(screen.getByLabelText('Modo apresentação'), 'valueChange', true);
    expect(useSettings.getState().demoMode).toBe(true);
    await fireEvent(screen.getByLabelText('Lembrete de passeio'), 'valueChange', true);
    await waitFor(() => expect(useSettings.getState().walkReminder).toBe(true));
    expect(useToastStore.getState().current?.message).toMatch(/18h/);

    await fireEvent(screen.getByLabelText('Lembrete de passeio'), 'valueChange', false);
    await waitFor(() => expect(useSettings.getState().walkReminder).toBe(false));
  });

  it('sem permissão de notificação não liga o lembrete', async () => {
    jest.mocked(Notifications.getPermissionsAsync).mockResolvedValueOnce({ granted: false } as never);
    jest.mocked(Notifications.requestPermissionsAsync).mockResolvedValueOnce({ granted: false } as never);
    await renderWithTheme(<ProfileScreen />);
    await fireEvent(screen.getByLabelText('Lembrete de passeio'), 'valueChange', true);
    await waitFor(() => expect(useToastStore.getState().current?.type).toBe('warning'));
    expect(useSettings.getState().walkReminder).toBe(false);
  });

  it('sair pede confirmação; sem pet o lembrete usa um nome genérico', async () => {
    api.logout.mockResolvedValue({} as never);
    usePets.setState({ pets: [], selectedId: null });
    useAuth.setState({ user: null });
    const alert = jest.spyOn(Alert, 'alert');
    await renderWithTheme(<ProfileScreen />);
    await fireEvent(screen.getByLabelText('Lembrete de passeio'), 'valueChange', true);
    await waitFor(() => expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({ content: expect.objectContaining({ body: 'Seu pet já está te esperando na porta.' }) })));

    await fireEvent.press(screen.getByRole('button', { name: 'Sair da conta' }));
    await act(() => alert.mock.calls[0][2]![1].onPress!());
    await waitFor(() => expect(useAuth.getState().status).toBe('signedOut'));
  });
});

describe('Cadastro de pet', () => {
  it('valida nome, nascimento e peso', async () => {
    await renderWithTheme(<PetFormScreen />);
    await fireEvent.changeText(screen.getByLabelText('Nascimento'), '01012099');
    await fireEvent.changeText(screen.getByLabelText('Peso (kg)'), '999');
    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar pet' }));
    expect(screen.getByText('Qual o nome do seu pet?')).toBeOnTheScreen();
    expect(screen.getByText('Data inválida.')).toBeOnTheScreen();
    expect(screen.getByText('Peso inválido.')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Nome'), 'R');
    await fireEvent.changeText(screen.getByLabelText('Nome'), 'Re');
    expect(screen.queryByText('Qual o nome do seu pet?')).toBeNull();
    await fireEvent.changeText(screen.getByLabelText('Nascimento'), '3102');
    await fireEvent.changeText(screen.getByLabelText('Peso (kg)'), '0');
    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar pet' }));
    expect(screen.getByText('Data inválida.')).toBeOnTheScreen();
    expect(screen.getByText('Peso inválido.')).toBeOnTheScreen();
  });

  it('cadastra com foto da câmera, meta ajustada e máscara de peso', async () => {
    api.createPet.mockResolvedValueOnce(makePet({ id: 9, name: 'Rex' }));
    await renderWithTheme(<PetFormScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Câmera' }));
    await waitFor(() => expect(screen.getByLabelText('file://camera.jpg')).toBeOnTheScreen());
    await fireEvent.changeText(screen.getByLabelText('Nome'), ' Rex ');
    await fireEvent.press(screen.getByLabelText('Gato'));
    await fireEvent.changeText(screen.getByLabelText('Raça'), ' SRD ');
    await fireEvent.changeText(screen.getByLabelText('Nascimento'), '10012022');
    await fireEvent.changeText(screen.getByLabelText('Peso (kg)'), '12.345');
    expect(screen.getByLabelText('Peso (kg)').props.value).toBe('12,34');
    await fireEvent.changeText(screen.getByLabelText('Peso (kg)'), 'a1234');
    expect(screen.getByLabelText('Peso (kg)').props.value).toBe('123');
    await fireEvent.changeText(screen.getByLabelText('Peso (kg)'), '12,5');
    await fireEvent.press(screen.getByLabelText('Aumentar meta'));
    await fireEvent.press(screen.getByLabelText('Diminuir meta'));
    await fireEvent.press(screen.getByLabelText('Diminuir meta'));
    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar pet' }));

    await waitFor(() => expect(global.__router.back).toHaveBeenCalled());
    expect(api.createPet).toHaveBeenCalledWith({
      name: 'Rex', species: 'cat', breed: 'SRD', birth_date: '2022-01-10', weight_kg: '12.5', daily_goal_minutes: 25, photoUri: 'file://camera.jpg',
    });
    expect(usePets.getState().selectedId).toBe(9);
    expect(useToastStore.getState().current?.message).toBe('Rex entrou para a família!');
  });

  it('limites da meta desabilitam os botões', async () => {
    usePets.setState({ pets: [makePet({ daily_goal_minutes: 10 })], selectedId: 1 });
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: '1' });
    await renderWithTheme(<PetFormScreen />);
    await fireEvent.press(screen.getByLabelText('Diminuir meta'));
    expect(screen.getByLabelText('Meta diária').props.accessibilityValue).toEqual({ text: '10 minutos' });

    usePets.setState({ pets: [makePet({ daily_goal_minutes: 180 })] });
    await renderWithTheme(<PetFormScreen />);
    await fireEvent.press(screen.getByLabelText('Aumentar meta'));
    expect(screen.getByLabelText('Meta diária').props.accessibilityValue).toEqual({ text: '180 minutos' });
  });

  it('edita um pet existente com foto da galeria', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: '1' });
    api.updatePet.mockResolvedValueOnce(makePet({ name: 'Thor II' }));
    await renderWithTheme(<PetFormScreen />);
    expect(screen.getByText('Editar Thor')).toBeOnTheScreen();
    expect(screen.getByLabelText('Peso (kg)').props.value).toBe('32,4');
    await fireEvent.press(screen.getByLabelText('Escolher foto do pet'));
    await waitFor(() => expect(screen.getByLabelText('file://gallery.jpg')).toBeOnTheScreen());
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar alterações' }));
    await waitFor(() => expect(api.updatePet).toHaveBeenCalledWith(1, expect.objectContaining({ name: 'Thor', photoUri: 'file://gallery.jpg' })));
    expect(useToastStore.getState().current?.message).toBe('Alterações salvas.');
  });

  it('sem permissão de câmera/galeria avisa; cancelar não muda a foto; erro ao salvar vira toast', async () => {
    jest.mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValueOnce({ granted: false } as never);
    jest.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValueOnce({ granted: false } as never);
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({ canceled: true } as never);
    api.createPet.mockRejectedValueOnce(new Error('x'));
    await renderWithTheme(<PetFormScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Câmera' }));
    await waitFor(() => expect(useToastStore.getState().current?.message).toBe('Permita o uso da câmera para tirar a foto.'));
    await fireEvent.press(screen.getByRole('button', { name: 'Galeria' }));
    await waitFor(() => expect(useToastStore.getState().current?.message).toBe('Permita o acesso às fotos.'));
    await fireEvent.press(screen.getByRole('button', { name: 'Galeria' }));
    expect(screen.queryByTestId('image')).toBeNull();

    await fireEvent.changeText(screen.getByLabelText('Nome'), 'Bob');
    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar pet' }));
    await waitFor(() => expect(useToastStore.getState().current?.type).toBe('danger'));
  });

  it('remove o pet depois de confirmar, com aviso se falhar', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: '2' });
    const alert = jest.spyOn(Alert, 'alert');
    await renderWithTheme(<PetFormScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Remover Mel' }));
    api.deletePet.mockRejectedValueOnce(new Error('x'));
    await act(() => alert.mock.calls[0][2]![1].onPress!());
    expect(useToastStore.getState().current?.type).toBe('danger');

    await fireEvent.press(screen.getByRole('button', { name: 'Remover Mel' }));
    api.deletePet.mockResolvedValueOnce({} as never);
    await act(() => alert.mock.calls[1][2]![1].onPress!());
    expect(usePets.getState().pets.map((p) => p.id)).toEqual([1]);
    expect(global.__router.back).toHaveBeenCalled();
    await fireEvent.press(screen.getByLabelText('Voltar'));
  });
});
