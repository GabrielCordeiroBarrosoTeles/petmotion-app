import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { Weather } from '@/services/types';
import type { UseWeatherResult } from './types';

export function useWeather(): UseWeatherResult {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (!perm.granted) return;
        const pos =
          (await Location.getLastKnownPositionAsync()) ??
          (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
        const c: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        const w = await api.weather(c[0], c[1]);
        if (alive) {
          setCoords(c);
          setWeather(w);
        }
      } catch {
        // clima é opcional: sem ele, a Home só não mostra o banner
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { weather, loading, coords };
}
