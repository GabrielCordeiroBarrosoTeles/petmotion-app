import type { HealthRecord, Pet, PetStats, User, Walk, Weather } from '@/services/types';

export const user: User = {
  id: 1, name: 'Gabriel Cordeiro', email: 'gabriel@petmotion.app', is_premium: false, premium_until: null, trial_available: true,
};

export const member: User = { ...user, is_premium: true, premium_until: '2026-12-17T12:00:00', trial_available: false };

export const makePet = (overrides: Partial<Pet> = {}): Pet => ({
  id: 1, name: 'Thor', species: 'dog', breed: 'Golden', birth_date: '2022-01-10', weight_kg: 32.4,
  daily_goal_minutes: 40, photo_url: null, role: 'owner', ...overrides,
});

export const makeWalk = (overrides: Partial<Walk> = {}): Walk => ({
  id: 10, pet_id: 1, started_at: '2026-11-17T18:00:00', ended_at: '2026-11-17T18:40:00', duration_seconds: 2460,
  distance_meters: 3420, steps: 4617, temperature_c: 22, points: [[0, 0], [0.001, 0.002]],
  events: [{ type: 'pee', lat: 0, lng: 0, occurred_at: '2026-11-17T18:10:00' }],
  pet: { id: 1, name: 'Thor', species: 'dog', photo_url: null }, ...overrides,
});

export const makeHealth = (overrides: Partial<HealthRecord> = {}): HealthRecord => ({
  id: 5, pet_id: 1, type: 'vaccine', title: 'V10', date: '2025-12-01', next_date: '2026-11-20', notes: null, ...overrides,
});

export const makeStats = (overrides: Partial<PetStats> = {}): PetStats => ({
  today: { minutes: 32, distance_meters: 2400, steps: 3100, walks: 1, goal_minutes: 40, goal_progress: 0.8 },
  week: ['11', '12', '13', '14', '15', '16', '17'].map((d) => ({ date: `2026-11-${d}`, minutes: 30, distance_meters: 2000 })),
  streak_days: 6,
  totals: { walks: 20, distance_meters: 50000, minutes: 600, steps: 70000 },
  achievements: [
    { code: 'first_walk', title: 'Primeiro passo', description: 'Complete o primeiro passeio', icon: 'footprints', progress: 1, unlocked: true },
    { code: 'total_25k', title: 'Maratonista', description: '25 km somados', icon: 'trophy', progress: 0.4, unlocked: false },
  ],
  upcoming_health: [makeHealth()],
  ...overrides,
});

export const weather: Weather = { air_c: 22, asphalt_c: 47, is_day: true, uv_index: 4, level: 'warning', message: 'Chão morno.' };
