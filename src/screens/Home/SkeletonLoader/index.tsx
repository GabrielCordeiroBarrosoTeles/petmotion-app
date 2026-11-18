import { Skeleton } from '@/components/Skeleton';
import { Center, Container, Flex, Row } from './styles';
import type { HomeSkeletonProps } from './types';

export function HomeSkeleton({ withHeader }: HomeSkeletonProps) {
  return (
    <Container accessibilityLabel="Carregando" accessibilityRole="progressbar">
      {withHeader ? (
        <Center>
          <Skeleton width={180} height={180} radius={90} />
        </Center>
      ) : null}
      <Skeleton height={84} radius={18} delay={80} />
      <Row>
        <Flex><Skeleton height={96} radius={18} delay={160} /></Flex>
        <Flex><Skeleton height={96} radius={18} delay={240} /></Flex>
      </Row>
      <Skeleton height={210} radius={18} delay={320} />
      <Skeleton width="40%" height={22} radius={8} delay={400} />
      <Row>
        <Skeleton width={112} height={120} radius={18} delay={460} />
        <Skeleton width={112} height={120} radius={18} delay={520} />
        <Skeleton width={112} height={120} radius={18} delay={580} />
      </Row>
    </Container>
  );
}
