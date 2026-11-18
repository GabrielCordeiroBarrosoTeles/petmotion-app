import { Skeleton } from '@/components/Skeleton';
import { Body, Container, Flex, Row } from './styles';
import type { WalkDetailSkeletonProps } from './types';

export function WalkDetailSkeleton({ mapHeight }: WalkDetailSkeletonProps) {
  return (
    <Container accessibilityLabel="Carregando passeio" accessibilityRole="progressbar">
      <Skeleton height={mapHeight} radius={0} />
      <Body>
        <Skeleton width="60%" height={28} radius={8} delay={80} />
        <Row>
          <Flex><Skeleton height={90} radius={18} delay={140} /></Flex>
          <Flex><Skeleton height={90} radius={18} delay={200} /></Flex>
        </Row>
        <Row>
          <Flex><Skeleton height={90} radius={18} delay={260} /></Flex>
          <Flex><Skeleton height={90} radius={18} delay={320} /></Flex>
        </Row>
      </Body>
    </Container>
  );
}
