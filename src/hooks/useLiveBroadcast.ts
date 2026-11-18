import axios from 'axios';
import { api } from '@/services/api';
import type { CreatedWalk, WalkEventType } from '@/services/types';
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

/**
 * Respostas que não melhoram tentando de novo: sessão vencida ou já encerrada (409), sem login (401),
 * pet que deixou de ser meu ou de existir (403/404). Sem rede ou erro do servidor: tenta no próximo envio.
 */
const TERMINAL = [401, 403, 404, 409];
const isTerminal = (e: unknown) => axios.isAxiosError(e) && TERMINAL.includes(e.response?.status as number);

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
    if (gen === generation && isTerminal(e)) stop();
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

/** Passeio salvo: fecha o ao vivo de cada pet transmitido com o registro dele (pet sem registro fica de fora). */
async function finish(saved: CreatedWalk) {
  const ids = petIds;
  const current = session;
  stop();
  if (!current) return;
  const walks = (saved.group_walks ?? []).filter((w) => ids.includes(w.pet_id));
  if (!walks.length) return;
  // sem rede: o estado ao vivo expira sozinho no servidor
  await api.liveFinish(current, walks).catch(() => undefined);
}

function cancel() {
  const ids = petIds;
  const current = session;
  stop();
  if (current) api.liveCancel(current, ids).catch(() => undefined);
}

const broadcast: LiveBroadcast = { start, finish, cancel };

// O passeio foi zerado por fora da tela (sair da conta, excluir a conta) ou a sessão caiu: encerra a
// transmissão. Ao sair pelo Perfil o passeio é zerado antes do logout, então o cancelamento ainda vai com o token.
useWalk.subscribe((state, prev) => {
  if (state.status === 'idle' && prev.status !== 'idle' && timer) cancel();
});
useAuth.subscribe((state, prev) => {
  if (prev.status === 'signedIn' && state.status !== 'signedIn' && timer) cancel();
});

/** Usado pelo WalkScreen: começa, termina e descarta a transmissão ao vivo. */
export function useLiveBroadcast(): LiveBroadcast {
  return broadcast;
}
