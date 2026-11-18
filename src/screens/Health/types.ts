import type { HealthRecord } from '@/services/types';

export interface HealthSections {
  due: HealthRecord[];
  history: HealthRecord[];
}
