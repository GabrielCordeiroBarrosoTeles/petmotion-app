import { renderHook } from '@testing-library/react-native';
import * as apiModule from '@/services/api';
import type { Pet } from '@/services/types';
import { usePets, useSelectedPet } from '../pets';

jest.mock('@/services/api', () => ({ api: { pets: jest.fn() } }));
const { api } = jest.mocked(apiModule);

const pet = (id: number, name = `Pet ${id}`): Pet => ({
  id, name, species: 'dog', breed: null, birth_date: null, weight_kg: null, daily_goal_minutes: 30, photo_url: null,
});

beforeEach(() => usePets.getState().reset());

describe('pets store', () => {
  it('carrega e seleciona o primeiro pet', async () => {
    api.pets.mockResolvedValueOnce([pet(1), pet(2)]);
    await usePets.getState().load();
    expect(usePets.getState()).toMatchObject({ loaded: true, selectedId: 1 });
  });

  it('mantém a seleção se o pet ainda existe, senão volta para o primeiro', async () => {
    usePets.setState({ selectedId: 2 });
    api.pets.mockResolvedValueOnce([pet(1), pet(2)]);
    await usePets.getState().load();
    expect(usePets.getState().selectedId).toBe(2);

    usePets.setState({ selectedId: 9 });
    api.pets.mockResolvedValueOnce([]);
    await usePets.getState().load();
    expect(usePets.getState().selectedId).toBeNull();
  });

  it('seleciona, insere, atualiza e remove', () => {
    const s = usePets.getState();
    s.upsert(pet(1));
    expect(usePets.getState().selectedId).toBe(1);
    s.upsert(pet(2));
    expect(usePets.getState().selectedId).toBe(2); // pet novo vira o selecionado
    s.select(1);
    s.upsert(pet(1, 'Thor'));
    expect(usePets.getState().pets.find((p) => p.id === 1)?.name).toBe('Thor');
    expect(usePets.getState().selectedId).toBe(1); // editar não muda a seleção

    s.remove(2);
    expect(usePets.getState().selectedId).toBe(1);
    s.remove(1);
    expect(usePets.getState()).toMatchObject({ pets: [], selectedId: null });
  });

  it('remover o pet selecionado escolhe o próximo', () => {
    usePets.setState({ pets: [pet(1), pet(2)], selectedId: 1 });
    usePets.getState().remove(1);
    expect(usePets.getState().selectedId).toBe(2);
  });

  it('useSelectedPet devolve o pet selecionado ou null', async () => {
    const { result, rerender } = await renderHook(() => useSelectedPet());
    expect(result.current).toBeNull();
    usePets.setState({ pets: [pet(7)], selectedId: 7 });
    await rerender({});
    expect(result.current?.id).toBe(7);
  });
});
