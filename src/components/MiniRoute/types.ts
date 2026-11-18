import type { LatLng } from '@/services/types';

export interface MiniRouteProps {
  points: LatLng[];
  width: number;
  height: number;
  color?: string;
  strokeWidth?: number;
  /** Anima o traço sendo desenhado. */
  animated?: boolean;
}
