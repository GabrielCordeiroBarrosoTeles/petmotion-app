import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';
import { AxiosError } from 'axios';
import { api, errorMessage, http, setAuthToken, setUnauthorizedHandler } from '../api';

type Reply = { status?: number; data?: unknown };
let calls: InternalAxiosRequestConfig[] = [];
let reply: (config: InternalAxiosRequestConfig) => Reply = () => ({ data: {} });

const adapter: AxiosAdapter = async (config) => {
  calls.push(config);
  const { status = 200, data = {} } = reply(config);
  const response = { data, status, statusText: '', headers: {}, config };
  if (status >= 400) throw new AxiosError('erro', String(status), config, null, response);
  return response;
};

beforeEach(() => {
  calls = [];
  reply = () => ({ data: {} });
  http.defaults.adapter = adapter;
  setAuthToken(null);
});

describe('base URL', () => {
  const load = (env: string | undefined, expoConfig: object | undefined) => {
    const Constants = jest.requireMock('expo-constants').default;
    const original = Constants.expoConfig;
    Constants.expoConfig = expoConfig;
    if (env) process.env.EXPO_PUBLIC_API_URL = env;
    let mod: typeof import('../api') | undefined;
    jest.isolateModules(() => {
      mod = require('../api');
    });
    delete process.env.EXPO_PUBLIC_API_URL;
    Constants.expoConfig = original;
    return mod!;
  };

  it('usa o IP do Metro quando não há variável de ambiente', () => {
    expect(http.defaults.baseURL).toBe('http://192.168.0.10:8000/api');
  });

  it('respeita EXPO_PUBLIC_API_URL e deriva a URL do site', () => {
    const mod = load('https://api.petmotion.app/api', undefined);
    expect(mod.http.defaults.baseURL).toBe('https://api.petmotion.app/api');
    expect(mod.siteUrl).toBe('https://api.petmotion.app');
  });

  it('cai para localhost sem hostUri', () => {
    expect(load(undefined, undefined).http.defaults.baseURL).toBe('http://localhost:8000/api');
  });
});

describe('autenticação', () => {
  it('coloca e remove o token Bearer', () => {
    setAuthToken('abc');
    expect(http.defaults.headers.common.Authorization).toBe('Bearer abc');
    setAuthToken(null);
    expect(http.defaults.headers.common.Authorization).toBeUndefined();
  });

  it('avisa quando a API responde 401', async () => {
    const onUnauthorized = jest.fn();
    setUnauthorizedHandler(onUnauthorized);
    reply = () => ({ status: 401 });
    await expect(api.me()).rejects.toBeInstanceOf(AxiosError);
    expect(onUnauthorized).toHaveBeenCalled();
  });

  it('não avisa em outros erros', async () => {
    const onUnauthorized = jest.fn();
    setUnauthorizedHandler(onUnauthorized);
    reply = () => ({ status: 500 });
    await expect(api.me()).rejects.toBeTruthy();
    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});

describe('errorMessage', () => {
  const axiosError = (data?: unknown) =>
    new AxiosError('x', '422', undefined, null, data === undefined ? undefined : ({ data, status: 422 } as never));

  it('explica falta de conexão', () => {
    expect(errorMessage(axiosError())).toMatch(/Sem conexão/);
  });

  it('usa o primeiro erro de validação do Laravel', () => {
    expect(errorMessage(axiosError({ message: 'geral', errors: { email: ['E-mail inválido.'] } }))).toBe('E-mail inválido.');
  });

  it('usa a mensagem geral ou um texto padrão', () => {
    expect(errorMessage(axiosError({ message: 'Clima indisponível.' }))).toBe('Clima indisponível.');
    expect(errorMessage(axiosError({}))).toBe('Algo deu errado. Tente de novo.');
    expect(errorMessage(new Error('qualquer'))).toBe('Algo deu errado. Tente de novo.');
  });
});

describe('endpoints', () => {
  it('me devolve o usuário logado', async () => {
    reply = () => ({ data: { id: 1, name: 'Ana' } });
    await expect(api.me()).resolves.toEqual({ id: 1, name: 'Ana' });
  });

  it('chama cada rota com o método e os dados certos', async () => {
    reply = () => ({ data: { ok: true } });
    const walk = { pet_id: 1 } as never;
    const health = { type: 'vet' } as never;

    await api.login('a@b.com', '123456');
    await api.register('Ana', 'a@b.com', '123456');
    await api.logout();
    await api.deleteAccount('123456');
    await api.startTrial();
    await api.pets();
    await api.deletePet(2);
    await api.stats(2);
    await api.walks(2);
    await api.walks(2, 3);
    await api.walk(5);
    await api.createWalk(walk);
    await api.deleteWalk(5);
    await api.health(2);
    await api.createHealth(2, health);
    await api.deleteHealth(9);
    await api.weather(-23.5, -46.6);

    expect(calls.map((c) => `${c.method} ${c.url}`)).toEqual([
      'post /login', 'post /register', 'post /logout', 'delete /me', 'post /premium/trial', 'get /pets', 'delete /pets/2', 'get /pets/2/stats',
      'get /walks', 'get /walks', 'get /walks/5', 'post /walks', 'delete /walks/5', 'get /pets/2/health-records',
      'post /pets/2/health-records', 'delete /health-records/9', 'get /weather',
    ]);
    expect(calls[3].data).toBe(JSON.stringify({ password: '123456' }));
    expect(calls[9].params).toEqual({ pet_id: 2, page: 3 });
    expect(calls[8].params).toEqual({ pet_id: 2, page: 1 });
    expect(calls[16].params).toEqual({ lat: -23.5, lng: -46.6 });
  });

  it('envia o pet como multipart, com foto e sem campos vazios', async () => {
    reply = () => ({ data: { id: 1 } });
    // o FormData do Node transforma objetos em texto; espionamos o que o app anexa
    const append = jest.spyOn(FormData.prototype, 'append');
    const appended = () => Object.fromEntries(append.mock.calls.map(([k, v]) => [k, v]));

    await api.createPet({ name: 'Thor', species: 'dog', breed: '', weight_kg: undefined, photoUri: 'file:///tmp/thor.jpg' });
    expect(calls[0].headers['Content-Type']).toBe('multipart/form-data');
    expect(appended()).toEqual({
      name: 'Thor',
      species: 'dog',
      photo: { uri: 'file:///tmp/thor.jpg', name: 'thor.jpg', type: 'image/jpeg' },
    });

    append.mockClear();
    await api.updatePet(1, { name: 'Thor II', photoUri: null });
    expect(calls[1].url).toBe('/pets/1');
    expect(appended()).toEqual({ name: 'Thor II' });

    append.mockClear();
    // URI sem nome de arquivo usa um nome padrão
    await api.updatePet(1, { photoUri: 'file://' });
    expect(appended().photo).toMatchObject({ name: 'pet.jpg' });
    append.mockRestore();
  });
});
