import { http, siteUrl } from './api';

/**
 * Cliente mínimo do protocolo Pusher 7 (Laravel Reverb), escrito em cima do WebSocket global
 * para não depender de biblioteca. Assina canais privados, responde ping, e reconecta com
 * espera crescente (1 s, 2 s, 4 s… até 30 s) reassinando tudo.
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
  if (!key) return inertClient;

  const endpoint = `${url.replace(/\/$/, '')}/app/${key}?protocol=7&client=js&version=8.4.0&flash=false`;
  let listeners: Listener[] = [];
  let socket: WebSocket | null = null;
  let socketId: string | null = null;
  let attempt = 0;
  let closed = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

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
      socketId = (parse(message.data) as { socket_id: string }).socket_id;
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

  function connect() {
    const ws = new WebSocket(endpoint);
    socket = ws;
    ws.onmessage = (e) => handle(e.data);
    ws.onclose = () => {
      socket = null;
      socketId = null;
      if (closed) return;
      const delay = Math.min(1000 * 2 ** attempt, MAX_DELAY);
      attempt += 1;
      timer = setTimeout(connect, delay);
    };
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
