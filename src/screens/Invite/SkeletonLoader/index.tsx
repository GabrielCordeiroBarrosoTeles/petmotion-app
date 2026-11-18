import { RFValue } from 'react-native-responsive-fontsize';
import { Skeleton } from '@/components/Skeleton';
import { Container, Lines } from './styles';

export function InviteSkeleton() {
  return (
    <Container accessibilityLabel="Carregando convite" accessibilityRole="progressbar">
      <Skeleton width={RFValue(120)} height={RFValue(120)} radius={RFValue(60)} />
      <Lines>
        <Skeleton width="80%" height={RFValue(28)} radius={8} delay={80} />
        <Skeleton width="50%" height={RFValue(28)} radius={8} delay={140} />
      </Lines>
    </Container>
  );
}
