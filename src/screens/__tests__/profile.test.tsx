import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { useLocalSearchParams } from 'expo-router';
import { act, answerConfirm, fireEvent, renderWithTheme, screen, waitFor } from '../../../test/render';
import { makePet, member, user } from '../../../test/fixtures';
import * as apiModule from '@/services/api';
import { useAuth } from '@/store/auth';
import { usePets } from '@/store/pets';
import { useSettings } from '@/store/settings';
import { useToastStore } from '@/store/toast';
import { PetFormScreen } from '../PetForm';
import { ProfileScreen } from '../Profile';

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  api: { createPet: jest.fn(), updatePet: jest.fn(), deletePet: jest.fn(), logout: jest.fn(), createInvite: jest.fn(), walkers: jest.fn() },
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
    await fireEvent.press(screen.getByRole('button', { name: 'Recebi um convite' }));
    expect(global.__router.push).toHaveBeenCalledWith('/scan-invite');
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir minha conta' }));
    expect(global.__router.push).toHaveBeenCalledWith('/delete-account');
  });

  it('com foto, o cartão mostra a foto no lugar das iniciais', async () => {
    useAuth.setState({ user: { ...user, photo_url: 'https://petmotion.app/seed/gabriel.jpg' } });
    await renderWithTheme(<ProfileScreen />);
    expect(screen.getByLabelText('https://petmotion.app/seed/gabriel.jpg')).toBeOnTheScreen();
    expect(screen.queryByText('GC')).toBeNull();
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

  it('cartão da Matilha: convite com teste grátis, convite de volta e membro ativo', async () => {
    const view = await renderWithTheme(<ProfileScreen />);
    await fireEvent.press(screen.getByLabelText(/^Entre para a Matilha\. 7 dias grátis/));
    expect(global.__router.push).toHaveBeenCalledWith('/premium');

    await act(() => useAuth.setState({ user: { ...user, trial_available: false } }));
    expect(screen.getByLabelText(/^Volte para a Matilha/)).toBeOnTheScreen();

    await act(() => useAuth.setState({ user: member }));
    expect(screen.getByLabelText(/^Você é da Matilha\. Ativa até 17 de dezembro de 2026/)).toBeOnTheScreen();
    expect(screen.getByLabelText('Membro da Matilha')).toBeOnTheScreen();
    await view.unmount();
  });

  it('pet de passeio não tem edição: mostra o dono e o toque não faz nada', async () => {
    usePets.setState({ pets: [makePet({ id: 7, name: 'Bidu', role: 'walker', owner_name: 'Ana' })], selectedId: 7, loaded: true });
    await renderWithTheme(<ProfileScreen />);
    expect(screen.getByText('Pet de Ana')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Editar Bidu')).toBeNull();
    await fireEvent.press(screen.getByLabelText('Bidu'));
    expect(global.__router.push).not.toHaveBeenCalledWith(expect.objectContaining({ pathname: '/pet-form' }));
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
    await renderWithTheme(<ProfileScreen />);
    await fireEvent(screen.getByLabelText('Lembrete de passeio'), 'valueChange', true);
    await waitFor(() => expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({ content: expect.objectContaining({ body: 'Seu pet já está te esperando na porta.' }) })));

    await fireEvent.press(screen.getByRole('button', { name: 'Sair da conta' }));
    await answerConfirm(false);
    expect(useAuth.getState().status).not.toBe('signedOut');
    await fireEvent.press(screen.getByRole('button', { name: 'Sair da conta' }));
    await answerConfirm(true);
    await waitFor(() => expect(useAuth.getState().status).toBe('signedOut'));
  });
});

describe('Cadastro de pet', () => {
  // membro da Matilha: sem o limite de 1 pet do plano grátis
  beforeEach(() => useAuth.setState({ user: member }));

  it('no plano grátis o 2º pet leva para a Matilha (sem chamar a API)', async () => {
    useAuth.setState({ user });
    await renderWithTheme(<PetFormScreen />);
    await fireEvent.changeText(screen.getByLabelText('Nome'), 'Rex');
    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar pet' }));
    expect(global.__router.push).toHaveBeenCalledWith('/premium');
    expect(useToastStore.getState().current?.message).toMatch(/plano grátis cabe 1 pet/);
    expect(api.createPet).not.toHaveBeenCalled();
  });

  it('no plano grátis, editar um pet existente continua liberado', async () => {
    useAuth.setState({ user });
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: '1' });
    api.updatePet.mockResolvedValueOnce(makePet());
    await renderWithTheme(<PetFormScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar alterações' }));
    await waitFor(() => expect(api.updatePet).toHaveBeenCalled());
  });

  it('dono editando vê "Compartilhar com passeador" e abre a folha do convite', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: '1' });
    api.createInvite.mockResolvedValueOnce({ code: 'K7M2QX9A', url: 'https://x/convite/K7M2QX9A', expires_at: '2026-11-20T12:00:00' });
    api.walkers.mockResolvedValueOnce([]);
    await renderWithTheme(<PetFormScreen />);
    expect(screen.queryByTestId('invite-modal')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Compartilhar com passeador' }));
    expect(screen.getByTestId('invite-modal')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Fechar' }));
    expect(screen.queryByTestId('invite-modal')).toBeNull();
  });

  it('passeador e pet novo não têm o botão de compartilhar', async () => {
    usePets.setState({ pets: [makePet({ role: 'walker' })], selectedId: 1, loaded: true });
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: '1' });
    await renderWithTheme(<PetFormScreen />);
    expect(screen.queryByRole('button', { name: 'Compartilhar com passeador' })).toBeNull();
    jest.mocked(useLocalSearchParams).mockReturnValue({});
    await renderWithTheme(<PetFormScreen />);
    expect(screen.queryByRole('button', { name: 'Compartilhar com passeador' })).toBeNull();
  });

  it('segurar o + repete e acelera; soltar não conta um passo a mais', async () => {
    jest.useFakeTimers();
    await renderWithTheme(<PetFormScreen />);
    const plus = screen.getByLabelText('Aumentar meta');
    await fireEvent(plus, 'pressIn');
    await act(() => jest.advanceTimersByTime(380)); // 1º passo depois de segurar
    await act(() => jest.advanceTimersByTime(304)); // 2º passo, já mais rápido
    await fireEvent(plus, 'pressOut');
    await fireEvent.press(plus); // o "press" de soltar é ignorado
    // pet novo começa em 30: dois passos segurando = 40
    expect(screen.getByLabelText('Meta diária').props.accessibilityValue).toEqual({ text: '40 minutos' });
    jest.useRealTimers();
  });

  it('toque simples anda 5; segurar até o limite para sozinho', async () => {
    jest.useFakeTimers();
    usePets.setState({ pets: [makePet({ daily_goal_minutes: 170 })], selectedId: 1 });
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: '1' });
    await renderWithTheme(<PetFormScreen />);
    await fireEvent(screen.getByLabelText('Diminuir meta'), 'pressIn');
    await fireEvent(screen.getByLabelText('Diminuir meta'), 'pressOut');
    await fireEvent.press(screen.getByLabelText('Diminuir meta'));
    expect(screen.getByLabelText('Meta diária').props.accessibilityValue).toEqual({ text: '165 minutos' });

    await fireEvent(screen.getByLabelText('Aumentar meta'), 'pressIn');
    await act(() => jest.advanceTimersByTime(5000));
    expect(screen.getByLabelText('Meta diária').props.accessibilityValue).toEqual({ text: '180 minutos' });
    await fireEvent(screen.getByLabelText('Aumentar meta'), 'pressOut');
    jest.useRealTimers();
  });
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
    await renderWithTheme(<PetFormScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Remover Mel' }));
    await answerConfirm(false);
    expect(api.deletePet).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('button', { name: 'Remover Mel' }));
    api.deletePet.mockRejectedValueOnce(new Error('x'));
    await answerConfirm(true);
    expect(useToastStore.getState().current?.type).toBe('danger');

    await fireEvent.press(screen.getByRole('button', { name: 'Remover Mel' }));
    api.deletePet.mockResolvedValueOnce({} as never);
    await answerConfirm(true);
    expect(usePets.getState().pets.map((p) => p.id)).toEqual([1]);
    expect(global.__router.back).toHaveBeenCalled();
    await fireEvent.press(screen.getByLabelText('Voltar'));
  });
});
