import axios from 'axios';
import { api } from '@/services/api';
import type { NewWalkPayload, Walk, WalkEventType } from '@/services/types';
import { useAuth } from '@/store/auth';
import { usePets } from '@/store/pets';
import { elapsedMs, useWalk } from '@/store/walk';
import type { LiveBroadcast } from './types';

/**
 * Transmissão do passeio para o pai/mãe de pet: só os pets de passeio (role 'walker') vão ao vivo.
 * Fica fora do React de propósito: minimizar a tela do passeio não pode parar a transmissão.
 */

export const LIVE_INTERVAL_MS = 5000;
/** Limite de pontos por envio aceito pela API. */
const MAX_POINTS = 2000;

let petIds: number[] = [];
let session: string | null = null;
/** Quantos pontos do trajeto já chegaram ao servidor. */
let sentPoints = 0;
let timer: ReturnType<typeof setInterval> | null = null;
let busy = false;
/** Muda a cada passeio: resposta atrasada de um passeio antigo é ignorada. */
let generation = 0;

const isConflict = (e: unknown) => axios.isAxiosError(e) && e.response?.status === 409;

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
  generation += 1;
  petIds = [];
  session = null;
  sentPoints = 0;
  busy = false;
}

function countsOf(events: { type: WalkEventType }[]) {
  const counts = { pee: 0, poop: 0, water: 0 };
  events.forEach((e) => (counts[e.type] += 1));
  return counts;
}

/** Abre a sessão (ou tenta de novo, se a rede falhou) ou manda o andamento com só os pontos novos. */
async function tick() {
  if (busy) return;
  busy = true;
  const gen = generation;
  const ids = petIds;
  try {
    if (!session) {
      const opened = await api.liveStart(ids);
      if (gen === generation) session = opened.session;
      // o passeio acabou enquanto a sessão abria: fecha para o pai/mãe não ver um passeio fantasma
      else api.liveCancel(opened.session, ids).catch(() => undefined);
      return;
    }
    const walk = useWalk.getState();
    const total = walk.points.length;
    await api.liveProgress(session, {
      pet_ids: ids,
      status: walk.status === 'paused' ? 'paused' : 'running',
      elapsed_ms: Math.round(elapsedMs(walk)),
      distance: Math.round(walk.distance),
      steps: walk.steps,
      points: walk.points.slice(sentPoints).slice(-MAX_POINTS),
      counts: countsOf(walk.events),
    });
    if (gen === generation) sentPoints = total;
  } catch (e) {
    // 409: o passeio já terminou ou outra sessão assumiu; sem rede: tenta no próximo envio
    if (gen === generation && isConflict(e)) stop();
  } finally {
    if (gen === generation) busy = false;
  }
}

function start(walkPetIds: number[]) {
  stop();
  const pets = usePets.getState().pets;
  const walkerIds = walkPetIds.filter((id) => pets.find((p) => p.id === id)?.role === 'walker');
  if (!walkerIds.length) return;
  petIds = walkerIds;
  timer = setInterval(tick, LIVE_INTERVAL_MS);
  tick();
}

/** Registro salvo de cada pet do grupo (a API devolve só o do primeiro; os outros vêm do histórico). */
async function walkIdFor(petId: number, saved: Walk, payload: NewWalkPayload): Promise<number | null> {
  if (petId === saved.pet_id) return saved.id;
  const me = useAuth.getState().user?.id;
  const { data } = await api.walks(petId);
  const match = data.find(
    (w) => w.walker?.id === me && w.duration_seconds === payload.duration_seconds && w.distance_meters === payload.distance_meters,
  );
  return match?.id ?? null;
}

async function finish(saved: Walk, payload: NewWalkPayload) {
  const ids = petIds;
  const current = session;
  stop();
  if (!current) return;
  try {
    const found = await Promise.all(ids.map(async (petId) => ({ pet_id: petId, walk_id: await walkIdFor(petId, saved, payload) })));
    const walks = found.filter((w): w is { pet_id: number; walk_id: number } => w.walk_id !== null);
    if (walks.length) await api.liveFinish(current, walks);
  } catch {
    // sem rede: o estado ao vivo expira sozinho no servidor
  }
}

function cancel() {
  const ids = petIds;
  const current = session;
  stop();
  if (current) api.liveCancel(current, ids).catch(() => undefined);
}

const broadcast: LiveBroadcast = { start, finish, cancel };

/** Usado pelo WalkScreen: começa, termina e descarta a transmissão ao vivo. */
export function useLiveBroadcast(): LiveBroadcast {
  return broadcast;
}
