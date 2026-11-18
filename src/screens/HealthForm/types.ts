import type { HealthType } from '@/services/types';

export interface HealthFormErrors {
  title?: string;
  date?: string;
  next_date?: string;
}

export interface NextDateShortcut {
  label: string;
  days: number;
}

export type SuggestionMap = Record<HealthType, string[]>;
