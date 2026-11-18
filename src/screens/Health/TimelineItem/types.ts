import type { HealthRecord } from '@/services/types';

export interface TimelineItemProps {
  record: HealthRecord;
  index: number;
  isLast: boolean;
  onLongPress: (record: HealthRecord) => void;
}
