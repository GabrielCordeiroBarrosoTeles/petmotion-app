import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors';
import { create } from 'zustand';
import type { LatLng, NewWalkPayload, WalkEvent, WalkEventType } from '@/services/types';
import { haversine } from '@/utils/geo';

type Status = 'idle' | 'running' | 'paused';

interface WalkState {
  status: Status;
  petId: number | null;
  startedAt: string | null;
  accumulatedMs: number;
  resumedAt: number | null;
  points: LatLng[];
  distance: number;
  steps: number;
  events: WalkEvent[];
  temperature: number | null;
  gpsReady: boolean;
  start: (opts: { petId: number; demo: boolean; temperature: number | null }) => Promise<void>;
  pause: () => void;
  resume: () => Promise<void>;
  addEvent: (type: WalkEventType) => boolean;
  finish: () => NewWalkPayload | null;
  reset: () => void;
}

/** Recursos nativos ficam fora do estado (não são serializáveis). */
let locationSub: Location.LocationSubscription | null = null;
let pedometerSub: { remove: () => void } | null = null;
let demoTimer: ReturnType<typeof setInterval> | null = null;
let stepsOffset = 0;
let demoMode = false;

const MAX_ACCURACY_M = 35;
const MIN_STEP_M = 4;
/** Passeio mais curto que isso não é salvo (parado, o GPS ainda "anda" alguns metros). */
export const MIN_WALK_M = 30;

function stopSensors() {
  locationSub?.remove();
  pedometerSub?.remove();
  if (demoTimer) clearInterval(demoTimer);
  locationSub = null;
  pedometerSub = null;
  demoTimer = null;
}

export function elapsedMs(s: Pick<WalkState, 'accumulatedMs' | 'resumedAt'>): number {
  return s.accumulatedMs + (s.resumedAt ? Date.now() - s.resumedAt : 0);
}

export const useWalk = create<WalkState>((set, get) => {
  /** accuracy = margem de erro da leitura: um salto menor que ela é tremido do GPS, não passo. */
  const pushPoint = (point: LatLng, accuracy = 0) => {
    const { points, distance } = get();
    const last = points[points.length - 1];
    if (!last) return set({ points: [point], gpsReady: true });
    const delta = haversine(last, point);
    if (delta < Math.max(MIN_STEP_M, accuracy)) return;
    set({ points: [...points, point], distance: distance + delta, gpsReady: true });
  };

  const startSensors = async () => {
    stepsOffset = get().steps;

    if (demoMode) {
      // Simula um passeio em laço a ~1,4 m/s partindo da última posição conhecida.
      let angle = 0;
      const origin = get().points[0] ?? (await currentPosition()) ?? ([-23.5874, -46.6576] as LatLng);
      demoTimer = setInterval(() => {
        angle += 0.045;
        const r = 0.0011 * (1 + Math.sin(angle * 3) * 0.15);
        pushPoint([origin[0] + Math.sin(angle) * r, origin[1] + (Math.cos(angle) - 1) * r * 1.2]);
        set((s) => ({ steps: s.steps + 2 + Math.round(Math.random()) }));
      }, 1000);
      return;
    }

    locationSub = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 3, timeInterval: 2000 },
      ({ coords }) => {
        const accuracy = coords.accuracy ?? 99;
        if (accuracy > MAX_ACCURACY_M) return;
        pushPoint([coords.latitude, coords.longitude], accuracy);
      },
    );

    if (await Pedometer.isAvailableAsync().catch(() => false)) {
      const perm = await Pedometer.requestPermissionsAsync().catch(() => null);
      if (perm?.granted) {
        pedometerSub = Pedometer.watchStepCount(({ steps }) => set({ steps: stepsOffset + steps }));
      }
    }
  };

  return {
    status: 'idle',
    petId: null,
    startedAt: null,
    accumulatedMs: 0,
    resumedAt: null,
    points: [],
    distance: 0,
    steps: 0,
    events: [],
    temperature: null,
    gpsReady: false,

    start: async ({ petId, demo, temperature }) => {
      stopSensors();
      demoMode = demo;
      set({
        status: 'running', petId, temperature, startedAt: new Date().toISOString(),
        accumulatedMs: 0, resumedAt: Date.now(), points: [], distance: 0, steps: 0, events: [], gpsReady: demo,
      });
      await startSensors();
    },

    pause: () => {
      stopSensors();
      const s = get();
      set({ status: 'paused', accumulatedMs: elapsedMs(s), resumedAt: null });
    },

    resume: async () => {
      set({ status: 'running', resumedAt: Date.now() });
      await startSensors();
    },

    addEvent: (type) => {
      const last = get().points[get().points.length - 1];
      if (!last) return false;
      set((s) => ({ events: [...s.events, { type, lat: last[0], lng: last[1], occurred_at: new Date().toISOString() }] }));
      return true;
    },

    finish: () => {
      stopSensors();
      const s = get();
      if (!s.petId || !s.startedAt) return null;
      const ms = elapsedMs(s);
      set({ status: 'paused', accumulatedMs: ms, resumedAt: null });
      return {
        pet_id: s.petId,
        started_at: s.startedAt,
        ended_at: new Date().toISOString(),
        duration_seconds: Math.max(1, Math.round(ms / 1000)),
        distance_meters: Math.round(s.distance),
        steps: s.steps,
        temperature_c: s.temperature,
        points: s.points,
        events: s.events,
      };
    },

    reset: () => {
      stopSensors();
      set({
        status: 'idle', petId: null, startedAt: null, accumulatedMs: 0, resumedAt: null,
        points: [], distance: 0, steps: 0, events: [], temperature: null, gpsReady: false,
      });
    },
  };
});

async function currentPosition(): Promise<LatLng | null> {
  try {
    const last = await Location.getLastKnownPositionAsync();
    const pos = last ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    return [pos.coords.latitude, pos.coords.longitude];
  } catch {
    return null;
  }
}
