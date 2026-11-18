import axios, { AxiosError } from 'axios';
import Constants from 'expo-constants';
import type {
  AuthResponse, HealthRecord, NewWalkPayload, Paginated, Pet, PetFormPayload, PetStats, User, Walk, Weather,
} from './types';

/**
 * Sem EXPO_PUBLIC_API_URL, usa o IP do Mac que está rodando o Metro (hostUri do Expo),
 * assim o celular na mesma rede acha a API sem configurar nada.
 */
function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;

  const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
  return `http://${host}:8000/api`;
}

/** Endereço do site (mesmo servidor da API, sem o /api): páginas de Termos e Privacidade. */
export const siteUrl = resolveBaseUrl().replace(/\/api\/?$/, '');

export const http = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 12000,
  headers: { Accept: 'application/json' },
});

let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  if (token) http.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete http.defaults.headers.common.Authorization;
}

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

http.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) onUnauthorized?.();
    return Promise.reject(error);
  },
);

/** Mensagem amigável a partir de um erro da API (validação do Laravel inclusa). */
export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Sem conexão com o servidor. Confira se a API está rodando.';
    const data = error.response.data as { message?: string; errors?: Record<string, string[]> };
    const firstField = data.errors && Object.values(data.errors)[0]?.[0];
    return firstField ?? data.message ?? 'Algo deu errado. Tente de novo.';
  }
  return 'Algo deu errado. Tente de novo.';
}

function petFormData(payload: Partial<PetFormPayload>): FormData {
  const form = new FormData();
  const { photoUri, ...fields } = payload;
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') form.append(key, String(value));
  });
  if (photoUri) {
    const name = photoUri.split('/').pop() || 'pet.jpg';
    form.append('photo', { uri: photoUri, name, type: 'image/jpeg' } as unknown as Blob);
  }
  return form;
}

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export const api = {
  login: (email: string, password: string) =>
    http.post<AuthResponse>('/login', { email, password }).then((r) => r.data),
  register: (name: string, email: string, password: string) =>
    http.post<AuthResponse>('/register', { name, email, password }).then((r) => r.data),
  me: () => http.get<User>('/me').then((r) => r.data),
  logout: () => http.post('/logout'),
  deleteAccount: (password: string) => http.delete('/me', { data: { password } }),
  startTrial: () => http.post<User>('/premium/trial').then((r) => r.data),

  pets: () => http.get<Pet[]>('/pets').then((r) => r.data),
  createPet: (payload: PetFormPayload) => http.post<Pet>('/pets', petFormData(payload), multipart).then((r) => r.data),
  updatePet: (id: number, payload: Partial<PetFormPayload>) =>
    http.post<Pet>(`/pets/${id}`, petFormData(payload), multipart).then((r) => r.data),
  deletePet: (id: number) => http.delete(`/pets/${id}`),
  stats: (petId: number) => http.get<PetStats>(`/pets/${petId}/stats`).then((r) => r.data),

  walks: (petId: number, page = 1) =>
    http.get<Paginated<Walk>>('/walks', { params: { pet_id: petId, page } }).then((r) => r.data),
  walk: (id: number) => http.get<Walk>(`/walks/${id}`).then((r) => r.data),
  createWalk: (payload: NewWalkPayload) => http.post<Walk>('/walks', payload).then((r) => r.data),
  deleteWalk: (id: number) => http.delete(`/walks/${id}`),

  health: (petId: number) => http.get<HealthRecord[]>(`/pets/${petId}/health-records`).then((r) => r.data),
  createHealth: (petId: number, payload: Omit<HealthRecord, 'id' | 'pet_id'>) =>
    http.post<HealthRecord>(`/pets/${petId}/health-records`, payload).then((r) => r.data),
  deleteHealth: (id: number) => http.delete(`/health-records/${id}`),

  weather: (lat: number, lng: number) => http.get<Weather>('/weather', { params: { lat, lng } }).then((r) => r.data),
};
