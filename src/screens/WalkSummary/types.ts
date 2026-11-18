import type { PetStats, Walk } from '@/services/types';

export interface SummaryData {
  walk: Walk;
  stats: PetStats;
}

export type SummaryParams = {
  id: string;
  before?: string;
};
