import type { LatLng, WalkEvent } from '@/services/types';

export interface RouteMapProps {
  points: LatLng[];
  events?: WalkEvent[];
  /** Segue o último ponto (passeio ao vivo). */
  follow?: boolean;
  interactive?: boolean;
  /** Espaço reservado por overlays (para o fitToCoordinates). */
  edgePadding?: { top: number; right: number; bottom: number; left: number };
}
