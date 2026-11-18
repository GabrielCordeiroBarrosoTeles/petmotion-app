import type { LatLng, Walk } from '@/services/types';

export type OverlayStyle = 'stats' | 'route' | 'band';

export interface PhotoOverlayProps {
  walk: Walk;
  petName: string;
  layout: OverlayStyle;
  width: number;
  height: number;
  premium?: boolean;
}

export interface StatItem {
  label: string;
  value: string;
}

export interface PhotoRouteProps {
  points: LatLng[];
  size: number;
  stroke: number;
}

export interface StatProps extends StatItem {
  big?: boolean;
}
