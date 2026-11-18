import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { realtimeFromEnv, type RealtimeClient } from '@/services/realtime';
import type { LiveWalk } from '@/services/types';
import { useAuth } from '@/store/auth';
import { useLive } from '@/store/live';
import { usePets } from '@/store/pets';
import { joinNames, km } from '@/utils/format';
import { notifyLive } from '@/utils/notifications';
import { customToast } from '@/utils/toast';

/** Sessões já avisadas ("start:uuid" / "finish:uuid"): num grupo, cada pet manda o mesmo evento. */
const announced = new Set<string>();

/** Marca como avisado; devolve false se já tinha avisado. */
function firstTime(key: string): boolean {
  if (announced.has(key)) return false;
  announced.add(key);
  return true;
}

/** O evento de descartado só traz sessão e status: os nomes só são lidos ao sair e ao voltar. */
function announce(petId: number, state: LiveWalk) {
  const url = `/live/${petId}`;
  const names = () => joinNames(state.pet_names);

  if (state.status === 'running' && firstTime(`start:${state.session}`)) {
    const verb = state.pet_names.length > 1 ? 'saíram' : 'saiu';
    const message = `${names()} ${verb} para passear com ${state.walker.name}`;
    notifyLive(message, 'Toque para acompanhar ao vivo.', url);
    customToast(`${message}.`, 'success');
  }

  if (state.status === 'finished' && firstTime(`finish:${state.session}`)) {
    const minutes = Math.max(1, Math.round(state.elapsed_ms / 60000));
    const verb = state.pet_names.length > 1 ? 'voltaram' : 'voltou';
    notifyLive(`${names()} ${verb}`, `${km(state.distance, 1)} km em ${minutes} min com ${state.walker.name}.`, url);
  }
}

function onEvent(petId: number, data: unknown) {
  const event = data as LiveWalk | undefined;
  // payload inválido (o cliente devolve undefined quando não é JSON) ou sem status: ignora
  if (!event?.status) return;
  announce(petId, event);
  useLive.getState().apply(petId, event);
}

/** Estado atual ao entrar (o passeio pode ter começado com o app fechado): atualiza sem avisar. */
async function loadCurrent(petId: number) {
  const state = await api.live(petId).catch(() => null);
  if (!state) return;
  announced.add(`start:${state.session}`);
  if (state.status === 'finished') announced.add(`finish:${state.session}`);
  useLive.getState().set(petId, state);
}

/**
 * Pai/mãe de pet: escuta o canal de cada pet seu e avisa quando alguém sai para passear com ele
 * e quando volta. Montado no Root; só age com a sessão aberta.
 */
export function useOwnerLive() {
  const signedIn = useAuth((s) => s.status === 'signedIn');
  const ownedKey = usePets((s) => s.pets.filter((p) => p.role === 'owner').map((p) => p.id).join(','));
  const [client, setClient] = useState<RealtimeClient | null>(null);

  // uma conexão só por sessão de login
  useEffect(() => {
    if (!signedIn) return;
    const created = realtimeFromEnv();
    setClient(created);
    return () => {
      created.close();
      setClient(null);
      useLive.getState().reset();
    };
  }, [signedIn]);

  useEffect(() => {
    if (!client || !ownedKey) return;
    const ids = ownedKey.split(',').map(Number);
    const offs = ids.map((id) => client.subscribe(`private-pet.${id}`, 'live.updated', (data) => onEvent(id, data)));
    ids.forEach(loadCurrent);
    return () => offs.forEach((off) => off());
  }, [client, ownedKey]);
}
