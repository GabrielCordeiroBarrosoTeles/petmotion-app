import * as Notifications from 'expo-notifications';
import { act, answerConfirm, fireEvent, pullToRefresh, renderWithTheme, screen, waitFor } from '../../../test/render';
import { makeHealth, makePet } from '../../../test/fixtures';
import * as apiModule from '@/services/api';
import { usePets } from '@/store/pets';
import { useToastStore } from '@/store/toast';
import { HealthScreen } from '../Health';
import { HealthFormScreen } from '../HealthForm';

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  api: { health: jest.fn(), createHealth: jest.fn(), deleteHealth: jest.fn() },
}));
const { api } = jest.mocked(apiModule);
// respostas "Once" não podem vazar de um teste para o outro
const resetApi = () => Object.values(api).forEach((fn) => (fn as jest.Mock).mockReset());
beforeEach(resetApi);

beforeEach(() => {
  jest.useFakeTimers({ advanceTimers: true }).setSystemTime(new Date('2026-11-17T22:30:00'));
  usePets.setState({ pets: [makePet()], selectedId: 1, loaded: true });
});
afterEach(() => jest.useRealTimers());

describe('Saúde: pet de passeio', () => {
  it('a carteirinha fica com o dono: sem busca e sem botão de adicionar', async () => {
    usePets.setState({ pets: [makePet({ name: 'Bidu', role: 'walker', owner_name: 'Ana' })], selectedId: 1, loaded: true });
    await renderWithTheme(<HealthScreen />);
    expect(screen.getByText('A saúde do Bidu fica com a Ana.')).toBeOnTheScreen();
    expect(api.health).not.toHaveBeenCalled();
    expect(screen.queryByLabelText('Adicionar cuidado')).toBeNull();
  });
});

describe('Saúde', () => {
  const records = [
    makeHealth({ id: 1, title: 'Drontal', type: 'vermifuge', next_date: '2026-11-15' }), // atrasado 2 dias
    makeHealth({ id: 2, title: 'V10', next_date: '2026-11-18' }), // amanhã
    makeHealth({ id: 3, title: 'Gripe', next_date: '2026-11-17' }), // hoje
    makeHealth({ id: 4, title: 'Antirrábica', next_date: '2026-12-11' }), // 24 dias
    makeHealth({ id: 5, title: 'Velha', next_date: '2026-09-01' }), // atrasada demais: fora dos próximos
    makeHealth({ id: 6, title: 'Ontem', next_date: '2026-11-16' }),
    makeHealth({ id: 7, title: 'Check-up', type: 'vet', next_date: null, notes: 'Tudo ótimo', date: '2026-10-01' }),
  ];

  it('mostra as próximas doses por prazo e o histórico em linha do tempo', async () => {
    api.health.mockResolvedValue(records);
    await renderWithTheme(<HealthScreen />);
    expect(await screen.findByText('Próximas doses')).toBeOnTheScreen();
    expect(screen.getByLabelText('Vermífugo Drontal, atrasado 2 dias')).toBeOnTheScreen();
    expect(screen.getByText('dias atrasado')).toBeOnTheScreen();
    expect(screen.getByText('dia atrasado')).toBeOnTheScreen();
    expect(screen.getByText('Hoje')).toBeOnTheScreen();
    expect(screen.getByText('dia')).toBeOnTheScreen();
    expect(screen.getByText('24')).toBeOnTheScreen();
    expect(screen.queryByLabelText(/Vacina Velha/)).toBeNull();
    expect(screen.getByText('Tudo ótimo')).toBeOnTheScreen();

    await fireEvent.press(screen.getByLabelText('Adicionar cuidado'));
    expect(global.__router.push).toHaveBeenCalledWith('/health-form');
  });

  it('segurar exclui com confirmação e desfaz se a API falhar', async () => {
    api.health.mockResolvedValue([records[6], records[1]]);
    await renderWithTheme(<HealthScreen />);

    await fireEvent(await screen.findByLabelText(/Consulta: Check-up/), 'longPress');
    await answerConfirm(false);
    expect(api.deleteHealth).not.toHaveBeenCalled();

    await fireEvent(screen.getByLabelText(/Consulta: Check-up/), 'longPress');
    api.deleteHealth.mockResolvedValueOnce({} as never);
    await answerConfirm(true);
    expect(screen.queryByLabelText(/Consulta: Check-up/)).toBeNull();
    expect(useToastStore.getState().current?.message).toBe('Registro excluído.');

    await fireEvent(screen.getByLabelText(/Vacina: V10/), 'longPress');
    api.deleteHealth.mockRejectedValueOnce(new Error('x'));
    await answerConfirm(true);
    expect(screen.getByLabelText(/Vacina: V10/)).toBeOnTheScreen();
    expect(useToastStore.getState().current?.type).toBe('danger');
  });

  it('trocar de pet com a confirmação aberta não quebra a exclusão', async () => {
    usePets.setState({ pets: [makePet(), makePet({ id: 2, name: 'Mel' })], selectedId: 1 });
    api.health.mockResolvedValueOnce([records[1]]);
    await renderWithTheme(<HealthScreen />);
    await fireEvent(await screen.findByLabelText(/Vacina: V10/), 'longPress');

    api.health.mockReturnValueOnce(new Promise(() => undefined)); // Mel ainda carregando
    await act(() => usePets.getState().select(2));
    api.deleteHealth.mockResolvedValueOnce({} as never);
    await answerConfirm(true);
    expect(api.deleteHealth).toHaveBeenCalledWith(2);
  });

  it('vazia convida a registrar; puxar para atualizar recarrega', async () => {
    api.health.mockResolvedValue([]);
    await renderWithTheme(<HealthScreen />);
    await screen.findByText('Carteirinha vazia');
    // o "+" do topo e o botão do estado vazio levam ao mesmo formulário
    const [, emptyStateButton] = screen.getAllByRole('button', { name: 'Adicionar cuidado' });
    await fireEvent.press(emptyStateButton);
    expect(global.__router.push).toHaveBeenCalledWith('/health-form');
    await pullToRefresh();
    expect(api.health).toHaveBeenCalledTimes(2);
  });

  it('sem pet convida a cadastrar', async () => {
    usePets.setState({ pets: [], selectedId: null });
    await renderWithTheme(<HealthScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar pet' }));
    expect(global.__router.push).toHaveBeenCalledWith('/pet-form');
  });

  it('exclusão de registro de outro pet some mesmo se a lista ainda não carregou', async () => {
    api.health.mockResolvedValue([records[1]]);
    await renderWithTheme(<HealthScreen />);
    await fireEvent(await screen.findByLabelText(/Vacina: V10/), 'longPress');
    api.deleteHealth.mockResolvedValueOnce({} as never);
    await answerConfirm(true);
    expect(await screen.findByText('Carteirinha vazia')).toBeOnTheScreen();
  });
});

describe('Novo cuidado', () => {
  it('valida nome e datas', async () => {
    await renderWithTheme(<HealthFormScreen />);
    expect(screen.getByLabelText('Aplicado em').props.value).toBe('17/11/2026'); // data local, mesmo às 22h30
    await fireEvent.changeText(screen.getByLabelText('Aplicado em'), '3102');
    await fireEvent.changeText(screen.getByLabelText('Próxima dose'), '99');
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar cuidado' }));
    expect(screen.getByText('Dê um nome ao cuidado.')).toBeOnTheScreen();
    expect(screen.getAllByText('Data inválida. Use DD/MM/AAAA.')).toHaveLength(2);

    await fireEvent.changeText(screen.getByLabelText('Nome'), 'V');
    await fireEvent.changeText(screen.getByLabelText('Nome'), 'V1');
    expect(screen.queryByText('Dê um nome ao cuidado.')).toBeNull();
    await fireEvent.changeText(screen.getByLabelText('Aplicado em'), '10112026');
    await fireEvent.changeText(screen.getByLabelText('Próxima dose'), '01112026');
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar cuidado' }));
    expect(screen.getByText('A próxima dose precisa ser depois da aplicação.')).toBeOnTheScreen();
  });

  it('usa sugestões e atalhos, salva e agenda o lembrete', async () => {
    api.createHealth.mockResolvedValueOnce({} as never);
    await renderWithTheme(<HealthFormScreen />);
    await fireEvent.press(screen.getByLabelText('Vermífugo'));
    await fireEvent.press(screen.getByLabelText('Drontal Plus'));
    await fireEvent.press(screen.getByLabelText('+3 meses'));
    expect(screen.getByLabelText('Próxima dose').props.value).toBe('15/02/2027');
    await fireEvent.changeText(screen.getByLabelText('Observações'), ' Lote 12 ');
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar cuidado' }));

    await waitFor(() => expect(global.__router.back).toHaveBeenCalled());
    expect(api.createHealth).toHaveBeenCalledWith(1, { type: 'vermifuge', title: 'Drontal Plus', date: '2026-11-17', next_date: '2027-02-15', notes: 'Lote 12' });
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    expect(useToastStore.getState().current?.message).toBe('Salvo! A gente te lembra um dia antes.');
  });

  it('sem próxima dose só registra; atalho sem data válida usa hoje', async () => {
    api.createHealth.mockResolvedValueOnce({} as never);
    await renderWithTheme(<HealthFormScreen />);
    await fireEvent.changeText(screen.getByLabelText('Aplicado em'), '17');
    await fireEvent.press(screen.getByLabelText('+15 dias'));
    expect(screen.getByLabelText('Próxima dose').props.value).toBe('02/12/2026');

    await fireEvent.changeText(screen.getByLabelText('Aplicado em'), '17112026');
    await fireEvent.changeText(screen.getByLabelText('Próxima dose'), '');
    await fireEvent.changeText(screen.getByLabelText('Nome'), 'Banho');
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar cuidado' }));
    await waitFor(() => expect(useToastStore.getState().current?.message).toBe('Cuidado registrado.'));
    expect(api.createHealth).toHaveBeenCalledWith(1, expect.objectContaining({ next_date: null, notes: null }));
  });

  it('sem permissão de notificação salva sem agendar; erro da API vira toast', async () => {
    jest.mocked(Notifications.getPermissionsAsync).mockResolvedValueOnce({ granted: false } as never);
    jest.mocked(Notifications.requestPermissionsAsync).mockResolvedValueOnce({ granted: false } as never);
    api.createHealth.mockResolvedValueOnce({} as never);
    await renderWithTheme(<HealthFormScreen />);
    await fireEvent.changeText(screen.getByLabelText('Nome'), 'V10');
    await fireEvent.press(screen.getByLabelText('+1 ano'));
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar cuidado' }));
    await waitFor(() => expect(global.__router.back).toHaveBeenCalled());
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();

    api.createHealth.mockRejectedValueOnce(new Error('x'));
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar cuidado' }));
    await waitFor(() => expect(useToastStore.getState().current?.type).toBe('danger'));
  });

  it('sem pet não salva; voltar fecha', async () => {
    usePets.setState({ pets: [], selectedId: null });
    await renderWithTheme(<HealthFormScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar cuidado' }));
    expect(api.createHealth).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByLabelText('Voltar'));
    expect(global.__router.back).toHaveBeenCalled();
  });
});
