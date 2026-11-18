import { router, useLocalSearchParams } from 'expo-router';
import { HeartCrack, PawPrint } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { RFValue } from 'react-native-responsive-fontsize';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { PetAvatar } from '@/components/PetAvatar';
import { useModalTopInset } from '@/hooks/useModalTopInset';
import { useSafeInsets } from '@/hooks/useSafeInsets';
import { api, errorMessage } from '@/services/api';
import type { InvitePreview } from '@/services/types';
import { usePets } from '@/store/pets';
import { celebrate } from '@/utils/haptics';
import { parseInviteCode } from '@/utils/invite';
import { customToast } from '@/utils/toast';
import { InviteSkeleton } from './SkeletonLoader';
import { Actions, Card, Message, Screen, Title } from './styles';
import type { InviteParams, InviteStatus } from './types';

export function InviteScreen() {
  const insets = useSafeInsets();
  const modalTop = useModalTopInset();
  const { code: raw } = useLocalSearchParams<InviteParams>();
  const code = parseInviteCode(raw ?? '');
  const adopt = usePets((s) => s.adopt);
  const [status, setStatus] = useState<InviteStatus>('loading');
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!code) {
      setStatus('invalid');
      return;
    }
    let active = true;
    setStatus('loading');
    api
      .invite(code)
      .then((data) => {
        if (!active) return;
        setPreview(data);
        setStatus('ready');
      })
      .catch((e) => active && setStatus(e?.response?.data?.error === 'own_pet' ? 'own' : 'invalid'));
    return () => {
      active = false;
    };
  }, [code]);

  const accept = async (inviteCode: string) => {
    setAccepting(true);
    try {
      const pet = await adopt(inviteCode);
      celebrate();
      customToast(`Pronto! Agora você passeia com o ${pet.name}.`, 'success');
      router.replace('/home');
    } catch (e) {
      customToast(errorMessage(e), 'danger');
      setAccepting(false);
    }
  };

  const close = () => router.back();

  if (status === 'invalid' || status === 'own') {
    const own = status === 'own';
    return (
      <Screen $top={modalTop} $bottom={insets.bottom}>
        <EmptyState
          icon={own ? PawPrint : HeartCrack}
          title={own ? 'Esse pet já é seu' : 'Esse convite não vale mais'}
          message={own ? 'Você é pai ou mãe dele. Quem recebe o convite é o passeador.' : 'Ele pode ter vencido ou já foi usado. Peça um novo para quem convidou.'}
          actionLabel="Fechar"
          onAction={close}
        />
      </Screen>
    );
  }

  return (
    <Screen $top={modalTop} $bottom={insets.bottom}>
      {status === 'ready' && preview ? (
        <Card>
          <PetAvatar pet={preview.pet} size={RFValue(120)} ring />
          <Title>{`${preview.owner.name} quer que você passeie com o ${preview.pet.name}`}</Title>
          <Message>Você vê os passeios dele e pode sair para passear. O pet continua sendo de quem convidou.</Message>
          <Actions>
            <Button title="Aceitar e passear" onPress={() => accept(preview.code)} loading={accepting} />
            <Button title="Agora não" variant="ghost" onPress={close} />
          </Actions>
        </Card>
      ) : (
        <InviteSkeleton />
      )}
    </Screen>
  );
}
