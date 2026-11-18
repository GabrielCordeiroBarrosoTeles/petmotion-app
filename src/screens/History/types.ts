import type { Walk } from '@/services/types';

export interface HistoryPage {
  items: Walk[];
  page: number;
  lastPage: number;
  total: number;
}
