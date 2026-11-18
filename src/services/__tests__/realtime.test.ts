import { http } from '../api';
import { createRealtime, realtimeFromEnv } from '../realtime';

class FakeSocket {
  static instances: FakeSocket[] = [];
  sent: { event: string; data: any }[] = [];
  onmessage: ((e: { data: unknown }) => void) | null = null;
  onclose: (() => void) | null = null;
  closed = false;

  constructor(public url: string) {
    FakeSocket.instances.push(this);
  }
  send(raw: string) {
    this.sent.push(JSON.parse(raw));
  }
  close() {
    this.closed = true;
    this.onclose?.();
  }
  emit(message: object | string) {
    this.onmessage?.({ data: typeof message === 'string' ? message : JSON.stringify(message) });
  }
  established(socketId = '123.456') {
    this.emit({ event: 'pusher:connection_established', data: JSON.stringify({ socket_id: socketId }) });
  }
  drop() {
    this.onclose?.();
  }
}

const last = () => FakeSocket.instances[FakeSocket.instances.length - 1];
const flush = () => jest.advanceTimersByTimeAsync(0);

let authorize: jest.Mock;
const make = (url = 'wss://x.test/') => createRealtime({ url, key: 'k', authorize });

beforeEach(() => {
  jest.useFakeTimers();
  FakeSocket.instances = [];
  (global as any).WebSocket = FakeSocket;
  authorize = jest.fn(async (socketId: string, channel: string) => `k:${socketId}:${channel}`);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('createRealtime', () => {
  it('conecta no endpoint do Reverb com o protocolo 7', () => {
    make();
    expect(last().url).toBe('wss://x.test/app/k?protocol=7&client=js&version=8.4.0&flash=false');
  });

  it('subscribes_after_connection_with_auth', async () => {
    const rt = make();
    rt.subscribe('private-pet.1', 'live.updated', jest.fn());
    expect(authorize).not.toHaveBeenCalled();
    last().established();
    await flush();
    expect(authorize).toHaveBeenCalledWith('123.456', 'private-pet.1');
    expect(last().sent).toEqual([
      { event: 'pusher:subscribe', data: { channel: 'private-pet.1', auth: 'k:123.456:private-pet.1' } },
    ]);
  });

  it('assina na hora quando já está conectado, uma vez só por canal', async () => {
    const rt = make();
    last().established();
    rt.subscribe('private-pet.1', 'live.updated', jest.fn());
    rt.subscribe('private-pet.1', 'other', jest.fn());
    await flush();
    expect(authorize).toHaveBeenCalledTimes(1);
    expect(last().sent).toHaveLength(1);
  });

  it('delivers_events_parsed', async () => {
    const rt = make();
    const cb = jest.fn();
    const other = jest.fn();
    rt.subscribe('private-pet.1', 'live.updated', cb);
    rt.subscribe('private-pet.2', 'live.updated', other);
    last().established();
    last().emit({ event: 'live.updated', channel: 'private-pet.1', data: JSON.stringify({ status: 'running' }) });
    last().emit({ event: 'live.updated', channel: 'private-pet.1', data: { status: 'paused' } });
    last().emit({ event: 'outro', channel: 'private-pet.1', data: '{}' });
    expect(cb).toHaveBeenNthCalledWith(1, { status: 'running' });
    expect(cb).toHaveBeenNthCalledWith(2, { status: 'paused' });
    expect(cb).toHaveBeenCalledTimes(2);
    expect(other).not.toHaveBeenCalled();
  });

  it('ignora mensagens inválidas, sem canal e dados que não são JSON', () => {
    const rt = make();
    const cb = jest.fn();
    rt.subscribe('private-pet.1', 'live.updated', cb);
    last().emit('não é json');
    last().emit({ event: 'pusher_internal:subscription_succeeded' });
    last().emit({ event: 'live.updated', channel: 'private-pet.1', data: '{quebrado' });
    expect(cb).toHaveBeenCalledWith(undefined);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('answers_ping', () => {
    make();
    last().emit({ event: 'pusher:ping' });
    expect(last().sent).toEqual([{ event: 'pusher:pong', data: {} }]);
  });

  it('reconnects_with_backoff_and_resubscribes', async () => {
    const rt = make();
    const cb = jest.fn();
    rt.subscribe('private-pet.1', 'live.updated', cb);
    last().established();
    await flush();

    const delays = [1000, 2000, 4000];
    for (const delay of delays) {
      const count = FakeSocket.instances.length;
      last().drop();
      await jest.advanceTimersByTimeAsync(delay - 1);
      expect(FakeSocket.instances).toHaveLength(count);
      await jest.advanceTimersByTimeAsync(1);
      expect(FakeSocket.instances).toHaveLength(count + 1);
    }

    last().established('9.9');
    await flush();
    expect(last().sent[0]).toEqual({
      event: 'pusher:subscribe',
      data: { channel: 'private-pet.1', auth: 'k:9.9:private-pet.1' },
    });
    last().emit({ event: 'live.updated', channel: 'private-pet.1', data: '{"a":1}' });
    expect(cb).toHaveBeenCalledWith({ a: 1 });

    // conectou: a espera volta para 1 s
    const count = FakeSocket.instances.length;
    last().drop();
    await jest.advanceTimersByTimeAsync(1000);
    expect(FakeSocket.instances).toHaveLength(count + 1);
  });

  it('limita a espera em 30 s', async () => {
    make();
    for (let i = 0; i < 7; i += 1) {
      last().drop();
      await jest.advanceTimersByTimeAsync(30000);
    }
    const count = FakeSocket.instances.length;
    last().drop();
    await jest.advanceTimersByTimeAsync(29999);
    expect(FakeSocket.instances).toHaveLength(count);
    await jest.advanceTimersByTimeAsync(1);
    expect(FakeSocket.instances).toHaveLength(count + 1);
  });

  it('unsubscribe_stops_delivery', async () => {
    const rt = make();
    const a = jest.fn();
    const b = jest.fn();
    const offA = rt.subscribe('private-pet.1', 'live.updated', a);
    const offB = rt.subscribe('private-pet.1', 'live.updated', b);
    last().established();
    await flush();
    offA();
    expect(last().sent.some((m) => m.event === 'pusher:unsubscribe')).toBe(false);
    last().emit({ event: 'live.updated', channel: 'private-pet.1', data: '{}' });
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
    offB();
    expect(last().sent[last().sent.length - 1]).toEqual({
      event: 'pusher:unsubscribe',
      data: { channel: 'private-pet.1' },
    });
  });

  it('cancelar antes de conectar não manda nada', () => {
    const rt = make();
    rt.subscribe('private-pet.1', 'live.updated', jest.fn())();
    last().established();
    expect(last().sent).toEqual([]);
    expect(authorize).not.toHaveBeenCalled();
  });

  it('não assina se o canal foi abandonado enquanto a auth voltava', async () => {
    const rt = make();
    const off = rt.subscribe('private-pet.1', 'live.updated', jest.fn());
    last().established();
    off();
    await flush();
    expect(last().sent).toEqual([{ event: 'pusher:unsubscribe', data: { channel: 'private-pet.1' } }]);
  });

  it('não assina numa conexão que já caiu enquanto a auth voltava', async () => {
    const rt = make();
    rt.subscribe('private-pet.1', 'live.updated', jest.fn());
    const first = last();
    first.established();
    first.drop();
    await flush();
    expect(first.sent).toEqual([]);
  });

  it('close_does_not_reconnect', async () => {
    const rt = make();
    const ws = last();
    rt.close();
    expect(ws.closed).toBe(true);
    await jest.advanceTimersByTimeAsync(60000);
    expect(FakeSocket.instances).toHaveLength(1);
  });

  it('close durante a espera cancela a reconexão', async () => {
    const rt = make();
    last().drop();
    rt.close();
    await jest.advanceTimersByTimeAsync(60000);
    expect(FakeSocket.instances).toHaveLength(1);
  });

  it('auth_failure_drops_only_that_channel', async () => {
    authorize.mockImplementation(async (socketId: string, channel: string) => {
      if (channel === 'private-pet.1') throw new Error('403');
      return `k:${socketId}:${channel}`;
    });
    const rt = make();
    rt.subscribe('private-pet.1', 'live.updated', jest.fn());
    rt.subscribe('private-pet.2', 'live.updated', jest.fn());
    last().established();
    await flush();
    expect(last().sent).toEqual([
      { event: 'pusher:subscribe', data: { channel: 'private-pet.2', auth: 'k:123.456:private-pet.2' } },
    ]);
  });

  it('sem chave devolve um cliente inerte', () => {
    const rt = createRealtime({ url: 'wss://x.test', key: '', authorize });
    expect(FakeSocket.instances).toHaveLength(0);
    const off = rt.subscribe('private-pet.1', 'live.updated', jest.fn());
    expect(() => {
      off();
      rt.close();
    }).not.toThrow();
  });
});

describe('realtimeFromEnv', () => {
  afterEach(() => {
    delete process.env.EXPO_PUBLIC_REVERB_URL;
    delete process.env.EXPO_PUBLIC_REVERB_KEY;
  });

  it('usa as variáveis de ambiente e autoriza via /broadcasting/auth', async () => {
    process.env.EXPO_PUBLIC_REVERB_URL = 'wss://petmotion.tolembrado.com.br';
    process.env.EXPO_PUBLIC_REVERB_KEY = 'abc';
    const post = jest.spyOn(http, 'post').mockResolvedValueOnce({ data: { auth: 'abc:sig' } });
    realtimeFromEnv().subscribe('private-pet.1', 'live.updated', jest.fn());
    expect(last().url).toBe(
      'wss://petmotion.tolembrado.com.br/app/abc?protocol=7&client=js&version=8.4.0&flash=false',
    );
    last().established();
    await flush();
    expect(post).toHaveBeenCalledWith('/broadcasting/auth', { socket_id: '123.456', channel_name: 'private-pet.1' });
    expect(last().sent[0].data.auth).toBe('abc:sig');
    post.mockRestore();
  });

  it('deriva a URL do site (http → ws) e fica inerte sem chave', () => {
    realtimeFromEnv();
    expect(FakeSocket.instances).toHaveLength(0);
    process.env.EXPO_PUBLIC_REVERB_KEY = 'abc';
    realtimeFromEnv();
    expect(last().url).toMatch(/^ws:\/\/192\.168\.0\.10:8000\/app\/abc\?/);
  });
});
