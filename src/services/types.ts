export type Species = 'dog' | 'cat';
export type WalkEventType = 'pee' | 'poop' | 'water';
export type HealthType = 'vaccine' | 'vermifuge' | 'medicine' | 'vet';
export type LatLng = [number, number];

export interface User {
  id: number;
  name: string;
  email: string;
  /** Membro da Matilha (plano premium) agora. */
  is_premium: boolean;
  premium_until: string | null;
  /** O teste grátis de 7 dias ainda não foi usado. */
  trial_available: boolean;
  photo_url?: string | null;
}

export type PetRole = 'owner' | 'walker';

export interface Pet {
  id: number;
  name: string;
  species: Species;
  breed: string | null;
  birth_date: string | null;
  weight_kg: number | null;
  daily_goal_minutes: number;
  photo_url: string | null;
  /** Dono do pet ou passeador convidado. */
  role: PetRole;
  /** Primeiro nome do dono (só quando role = 'walker'). */
  owner_name?: string;
}

export interface WalkEvent {
  id?: number;
  type: WalkEventType;
  lat: number;
  lng: number;
  occurred_at: string;
}

export interface Walk {
  id: number;
  pet_id: number;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  distance_meters: number;
  steps: number;
  temperature_c: number | null;
  points: LatLng[];
  events: WalkEvent[];
  pet?: Pick<Pet, 'id' | 'name' | 'species' | 'photo_url'>;
  /** Quem passeou (pode ser o dono ou um passeador). */
  walker?: { id: number; name: string };
}

export interface NewWalkPayload extends Omit<Walk, 'id' | 'pet'> {}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export interface Achievement {
  code: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  unlocked: boolean;
}

export interface HealthRecord {
  id: number;
  pet_id: number;
  type: HealthType;
  title: string;
  date: string;
  next_date: string | null;
  notes: string | null;
}

export interface PetStats {
  today: {
    minutes: number;
    distance_meters: number;
    steps: number;
    walks: number;
    goal_minutes: number;
    goal_progress: number;
  };
  week: { date: string; minutes: number; distance_meters: number }[];
  streak_days: number;
  totals: { walks: number; distance_meters: number; minutes: number; steps: number };
  achievements: Achievement[];
  upcoming_health: HealthRecord[];
}

export interface Weather {
  air_c: number;
  asphalt_c: number;
  is_day: boolean;
  uv_index: number | null;
  level: 'safe' | 'warning' | 'danger';
  message: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PetFormPayload {
  name: string;
  species: Species;
  breed?: string;
  birth_date?: string;
  weight_kg?: string;
  daily_goal_minutes?: number;
  photoUri?: string | null;
}

export interface Invite {
  code: string;
  url: string;
  expires_at: string;
}

export interface InvitePreview {
  code: string;
  expires_at: string;
  pet: Pick<Pet, 'id' | 'name' | 'species' | 'photo_url'>;
  owner: { name: string };
}

export interface Walker {
  id: number;
  name: string;
}

export type LiveStatus = 'running' | 'paused' | 'finished' | 'cancelled';
export type LiveCounts = Record<WalkEventType, number>;

/** Estado do passeio ao vivo (GET /pets/{id}/live e evento `live.updated`). */
export interface LiveWalk {
  session: string;
  status: LiveStatus;
  walker: Walker;
  pet_id: number;
  pet_names: string[];
  started_at: string;
  elapsed_ms: number;
  at: string;
  distance: number;
  steps: number;
  /** Rota inteira (só no GET). */
  points?: LatLng[];
  /** Pontos novos desde o último evento (só no socket, até 200). */
  new_points?: LatLng[];
  truncated?: true;
  counts: LiveCounts;
  walk_id?: number;
}

export interface LiveProgressPayload {
  pet_ids: number[];
  status: 'running' | 'paused';
  elapsed_ms: number;
  distance: number;
  steps: number;
  /** Só os pontos NOVOS desde o último envio. */
  points: LatLng[];
  counts: LiveCounts;
}
