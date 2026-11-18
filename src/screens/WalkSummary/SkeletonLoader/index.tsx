import { Skeleton } from '@/components/Skeleton';
import { Container } from './styles';
import type { WalkSummarySkeletonProps } from './types';

export function WalkSummarySkeleton({ top }: WalkSummarySkeletonProps) {
  return (
    <Container $top={top} accessibilityLabel="Carregando resumo" accessibilityRole="progressbar">
      <Skeleton width="70%" height={40} radius={10} />
      <Skeleton width="50%" height={18} radius={8} delay={80} />
      <Skeleton height={380} radius={28} delay={160} />
      <Skeleton height={56} radius={28} delay={240} />
    </Container>
  );
}
