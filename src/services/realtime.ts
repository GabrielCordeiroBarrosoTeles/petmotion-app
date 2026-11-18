import { http, siteUrl } from './api';

/**
 * Cliente mínimo do protocolo Pusher 7 (Laravel Reverb), escrito em cima do WebSocket global
 * para não depender de biblioteca. Assina canais privados, responde ping, e reconecta com
 * espera crescente (1 s, 2 s, 4 s… até 30 s) reassinando tudo.
 *
 * Socket morto (rede trocou, celular dormiu) nem sempre dispara `onclose`. Como o pusher-js:
 * depois de `activity_timeout` segundos sem mensagem nenhuma, manda `pusher:ping`; se nada
 * chegar em 30 s, larga essa conexão e reconecta.
 */

export interface RealtimeClient {
  /** Escuta `event` em `channel`. Devolve a função que cancela a escuta. */
  subscribe: (channel: string, event: string, cb: (data: unknown) => void) => () => void;
  close: () => void;
}

export interface RealtimeOptions {
  /** Base ws(s) do servidor, sem /app (ex.: wss://petmotion.tolembrado.com.br). */
  url: string;
  key: string;
  /** Pede ao servidor a assinatura do canal privado (POST /broadcasting/auth). */
  authorize: (socketId: string, channel: string) => Promise<string>;
}

interface Listener {
  channel: string;
  event: string;
  cb: (data: unknown) => void;
}

const MAX_DELAY = 30000;
/** Segundos sem mensagem antes do ping, se o servidor não disser outro valor. */
const DEFAULT_ACTIVITY_TIMEOUT = 120;
const PONG_TIMEOUT = 30000;

let warnedMissingKey = false;

/** Em desenvolvimento, avisa (uma vez) por que o ao vivo não atualiza sozinho. */
function warnMissingKey() {
  if (!__DEV__ || warnedMissingKey) return;
  warnedMissingKey = true;
  console.warn(
    '[realtime] EXPO_PUBLIC_REVERB_KEY está vazio: o passeio ao vivo não vai atualizar sozinho. ' +
      'Preencha EXPO_PUBLIC_REVERB_URL e EXPO_PUBLIC_REVERB_KEY no .env (veja o .env.example).',
  );
}

/** Cliente "mudo": sem chave do Reverb não há como conectar, então nada acontece. */
const inertClient: RealtimeClient = { subscribe: () => () => {}, close: () => {} };

function parse(raw: unknown): unknown {
  if (typeof raw !== 'string') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function createRealtime({ url, key, authorize }: RealtimeOptions): RealtimeClient {
  if (!key) {
    warnMissingKey();
    return inertClient;
  }

  const endpoint = `${url.replace(/\/$/, '')}/app/${key}?protocol=7&client=js&version=8.4.0&flash=false`;
  let listeners: Listener[] = [];
  let socket: WebSocket | null = null;
  let socketId: string | null = null;
  let attempt = 0;
  let closed = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let activityMs = DEFAULT_ACTIVITY_TIMEOUT * 1000;
  let activityTimer: ReturnType<typeof setTimeout> | undefined;
  let pongTimer: ReturnType<typeof setTimeout> | undefined;

  const send = (event: string, data: unknown) => socket?.send(JSON.stringify({ event, data }));
  const hasChannel = (channel: string) => listeners.some((l) => l.channel === channel);

  function subscribeChannel(channel: string) {
    const current = socket;
    authorize(socketId as string, channel)
      .then((auth) => {
        // A conexão pode ter caído ou o canal ter sido abandonado enquanto a auth voltava.
        if (current === socket && hasChannel(channel)) send('pusher:subscribe', { channel, auth });
      })
      .catch(() => {
        // Sem autorização, só esse canal fica de fora; os outros seguem.
      });
  }

  function handle(raw: unknown) {
    const message = parse(raw) as { event?: string; channel?: string; data?: unknown } | undefined;
    if (!message) return;

    if (message.event === 'pusher:connection_established') {
      const info = parse(message.data) as { socket_id: string; activity_timeout?: number };
      socketId = info.socket_id;
      activityMs = (info.activity_timeout || DEFAULT_ACTIVITY_TIMEOUT) * 1000;
      attempt = 0;
      [...new Set(listeners.map((l) => l.channel))].forEach(subscribeChannel);
    } else if (message.event === 'pusher:ping') {
      send('pusher:pong', {});
    } else if (message.channel) {
      const data = parse(message.data);
      listeners
        .filter((l) => l.channel === message.channel && l.event === message.event)
        .forEach((l) => l.cb(data));
    }
  }

  function stopWatching() {
    clearTimeout(activityTimer);
    clearTimeout(pongTimer);
  }

  /** Qualquer mensagem prova que a conexão vive: recomeça a contagem até o próximo ping. */
  function watch(ws: WebSocket) {
    stopWatching();
    activityTimer = setTimeout(() => {
      send('pusher:ping', {});
      pongTimer = setTimeout(() => abandon(ws), PONG_TIMEOUT);
    }, activityMs);
  }

  function lost() {
    stopWatching();
    socket = null;
    socketId = null;
    if (closed) return;
    const delay = Math.min(1000 * 2 ** attempt, MAX_DELAY);
    attempt += 1;
    timer = setTimeout(connect, delay);
  }

  /** Conexão que parou de responder: o `onclose` pode demorar ou nunca vir, então não espera por ele. */
  function abandon(ws: WebSocket) {
    ws.onmessage = null;
    ws.onclose = null;
    ws.close();
    lost();
  }

  function connect() {
    const ws = new WebSocket(endpoint);
    socket = ws;
    ws.onmessage = (e) => {
      handle(e.data);
      if (socketId) watch(ws);
    };
    ws.onclose = lost;
  }

  connect();

  return {
    subscribe(channel, event, cb) {
      const listener = { channel, event, cb };
      const isNewChannel = !hasChannel(channel);
      listeners.push(listener);
      if (isNewChannel && socketId) subscribeChannel(channel);

      return () => {
        listeners = listeners.filter((l) => l !== listener);
        if (socketId && !hasChannel(channel)) send('pusher:unsubscribe', { channel });
      };
    },
    close() {
      closed = true;
      stopWatching();
      if (timer) clearTimeout(timer);
      socket?.close();
    },
  };
}

/** Config vinda do ambiente; sem URL explícita, deriva do site (https → wss, http → ws). */
export function realtimeFromEnv(): RealtimeClient {
  return createRealtime({
    url: process.env.EXPO_PUBLIC_REVERB_URL || siteUrl.replace(/^http/, 'ws'),
    key: process.env.EXPO_PUBLIC_REVERB_KEY ?? '',
    authorize: (socketId, channel) =>
      http
        .post<{ auth: string }>('/broadcasting/auth', { socket_id: socketId, channel_name: channel })
        .then((r) => r.data.auth),
  });
}
