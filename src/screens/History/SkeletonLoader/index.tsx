import { Skeleton } from '@/components/Skeleton';
import { Container, Lines, Row } from './styles';
import type { HistorySkeletonProps } from './types';

export function HistorySkeleton({ rows = 6 }: HistorySkeletonProps) {
  return (
    <Container accessibilityLabel="Carregando passeios" accessibilityRole="progressbar">
      <Skeleton height={86} radius={18} />
      {Array.from({ length: rows }, (_, i) => (
        <Row key={i}>
          <Skeleton width={76} height={76} radius={14} delay={i * 70} />
          <Lines>
            <Skeleton width="40%" height={12} radius={6} delay={i * 70} />
            <Skeleton width="55%" height={22} radius={8} delay={i * 70 + 40} />
            <Skeleton width="70%" height={12} radius={6} delay={i * 70 + 80} />
          </Lines>
        </Row>
      ))}
    </Container>
  );
}
