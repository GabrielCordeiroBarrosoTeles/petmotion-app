import { RFValue } from 'react-native-responsive-fontsize';
import { Skeleton } from '@/components/Skeleton';
import { Container, Flex, Row, Sheet } from './styles';
import type { LiveWalkSkeletonProps } from './types';

export function LiveWalkSkeleton({ bottom }: LiveWalkSkeletonProps) {
  return (
    <Container accessibilityLabel="Carregando passeio ao vivo" accessibilityRole="progressbar">
      <Sheet $bottom={bottom}>
        <Skeleton width="55%" height={RFValue(56)} radius={RFValue(10)} />
        <Skeleton width="40%" height={RFValue(16)} radius={RFValue(8)} delay={80} />
        <Row>
          <Flex><Skeleton height={RFValue(40)} radius={RFValue(20)} delay={140} /></Flex>
          <Flex><Skeleton height={RFValue(40)} radius={RFValue(20)} delay={200} /></Flex>
        </Row>
      </Sheet>
    </Container>
  );
}
