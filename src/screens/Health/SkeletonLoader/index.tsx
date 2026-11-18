import { Skeleton } from '@/components/Skeleton';
import { Container, Lines, Row } from './styles';
import type { HealthSkeletonProps } from './types';

export function HealthSkeleton({ items = 5 }: HealthSkeletonProps) {
  return (
    <Container accessibilityLabel="Carregando cuidados" accessibilityRole="progressbar">
      <Row>
        <Skeleton width={150} height={130} radius={18} />
        <Skeleton width={150} height={130} radius={18} delay={80} />
      </Row>
      <Skeleton width="35%" height={22} radius={8} delay={140} />
      {Array.from({ length: items }, (_, i) => (
        <Row key={i}>
          <Skeleton width={40} height={40} radius={20} delay={200 + i * 60} />
          <Lines>
            <Skeleton width="60%" height={16} radius={6} delay={200 + i * 60} />
            <Skeleton width="35%" height={12} radius={6} delay={240 + i * 60} />
          </Lines>
        </Row>
      ))}
    </Container>
  );
}
