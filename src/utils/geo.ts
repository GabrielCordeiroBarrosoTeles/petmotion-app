import type { LatLng } from '@/services/types';

const R = 6371000;
const rad = (deg: number) => (deg * Math.PI) / 180;

export function haversine([lat1, lng1]: LatLng, [lat2, lng2]: LatLng): number {
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Centro padrão (Parque Ibirapuera, SP) quando ainda não há posição. */
export const DEFAULT_CENTER: [number, number] = [-46.6576, -23.5874];

/** [lat, lng] do app → [lng, lat] do MapLibre (GeoJSON). */
export const toLngLat = ([lat, lng]: LatLng): [number, number] => [lng, lat];

/** Caixa [oeste, sul, leste, norte] que contém os pontos (null sem pontos). */
export function boundsFor(points: LatLng[]): [number, number, number, number] | null {
  if (!points.length) return null;
  const lats = points.map((p) => p[0]);
  const lngs = points.map((p) => p[1]);
  return [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)];
}

/** Projeta a rota num quadro WxH (para desenhar o trajeto em SVG, ex.: card de compartilhar). */
export function projectRoute(points: LatLng[], width: number, height: number, pad = 12): string {
  if (points.length < 2) return '';
  const lats = points.map((p) => p[0]);
  const lngs = points.map((p) => p[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const spanLat = maxLat - minLat || 1e-6;
  const spanLng = maxLng - minLng || 1e-6;
  const scale = Math.min((width - pad * 2) / spanLng, (height - pad * 2) / spanLat);
  const offX = (width - spanLng * scale) / 2;
  const offY = (height - spanLat * scale) / 2;
  return points
    .map(([lat, lng], i) => {
      const x = offX + (lng - minLng) * scale;
      const y = offY + (maxLat - lat) * scale;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}
