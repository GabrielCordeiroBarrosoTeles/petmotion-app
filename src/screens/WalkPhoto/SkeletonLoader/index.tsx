import { Skeleton } from '@/components/Skeleton';
import { Container } from './styles';
import type { WalkPhotoSkeletonProps } from './types';

export function WalkPhotoSkeleton({ width, height }: WalkPhotoSkeletonProps) {
  return (
    <Container accessibilityLabel="Carregando passeio" accessibilityRole="progressbar">
      <Skeleton width={width} height={height} radius={28} />
      <Skeleton height={50} radius={14} delay={120} />
    </Container>
  );
}
