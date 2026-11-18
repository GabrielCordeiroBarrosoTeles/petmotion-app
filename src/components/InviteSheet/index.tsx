import { UserMinus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Modal, Share } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import QRCode from 'react-native-qrcode-svg';
import { useReducedMotion } from 'react-native-reanimated';
import { useTheme } from 'styled-components/native';
import { useSafeInsets } from '@/hooks/useSafeInsets';
import { api, errorMessage } from '@/services/api';
import type { Invite, Walker } from '@/services/types';
import { spring, timing } from '@/theme/motion';
import { confirmAction } from '@/utils/confirm';
import { customToast } from '@/utils/toast';
import { Button } from '../Button';
import { PressableScale } from '../PressableScale';
import { Skeleton } from '../Skeleton';
import {
  Backdrop, BackdropPress, Close, CloseText, Code, Message, QrBox, Sheet, Title, WalkerList, WalkerName, WalkerRow, WalkersTitle,
} from './styles';
import type { InviteSheetProps } from './types';

const spaced = (code: string) => `${code.slice(0, 4)} ${code.slice(4)}`;

/**
 * Folha "Compartilhar com passeador": cria um convite (8 caracteres, 48 h, uso único),
 * mostra o QR e o código, envia o link e lista quem já passeia com o pet.
 */
export function InviteSheet({ pet, visible, onClose }: InviteSheetProps) {
  const theme = useTheme();
  const insets = useSafeInsets();
  const reduced = useReducedMotion();
  const [invite, setInvite] = useState<Invite | null>(null);
  const [walkers, setWalkers] = useState<Walker[]>([]);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    setInvite(null);
    api.walkers(pet.id).then((list) => active && setWalkers(list)).catch(() => undefined);
    api
      .createInvite(pet.id)
      .then((created) => active && setInvite(created))
      .catch((e) => {
        customToast(errorMessage(e), 'danger');
        onClose();
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, pet.id]);

  const send = () =>
    Share.share({ message: `Oi! Quero que você passeie com o ${pet.name} no PetMotion. Abra: ${invite?.url}` }).catch(() => undefined);

  const removeWalker = async (walker: Walker) => {
    const ok = await confirmAction({
      title: `Tirar ${walker.name}?`,
      message: `${walker.name} deixa de ver e de passear com o ${pet.name}.`,
      confirmLabel: 'Tirar passeador',
      icon: UserMinus,
    });
    if (!ok) return;
    try {
      await api.removeWalker(pet.id, walker.id);
      setWalkers((list) => list.filter((w) => w.id !== walker.id));
      customToast(`${walker.name} não passeia mais com o ${pet.name}.`, 'success');
    } catch (e) {
      customToast(errorMessage(e), 'danger');
    }
  };

  if (!visible) return null;

  return (
    <Modal testID="invite-modal" transparent visible statusBarTranslucent navigationBarTranslucent animationType="none" onRequestClose={onClose}>
      <Backdrop from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={timing({ duration: theme.motion.base })}>
        <BackdropPress onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar convite" />
      </Backdrop>
      <Sheet
        $bottom={insets.bottom}
        from={{ translateY: reduced ? 0 : RFValue(520) }}
        animate={{ translateY: 0 }}
        transition={spring(theme.motion.spring)}
      >
        <Title accessibilityRole="header">Compartilhar com passeador</Title>
        <Message>
          Quem ler o QR ou abrir o link passeia com o {pet.name}. O convite vale por 48 horas e serve para uma pessoa só.
        </Message>
        <QrBox>
          {invite ? <QRCode value={invite.url} size={RFValue(172)} /> : <Skeleton width="86%" height={RFValue(172)} radius={theme.radii.small} />}
        </QrBox>
        {invite ? <Code>{spaced(invite.code)}</Code> : null}
        <Button title="Enviar convite" variant="primary" onPress={send} disabled={!invite} />
        {walkers.length ? (
          <WalkerList>
            <WalkersTitle>{`Quem passeia com o ${pet.name}`}</WalkersTitle>
            {walkers.map((w) => (
              <WalkerRow key={w.id}>
                <WalkerName numberOfLines={1}>{w.name}</WalkerName>
                <PressableScale onPress={() => removeWalker(w)} accessibilityLabel={`Remover ${w.name}`} hitSlop={8}>
                  <UserMinus size={RFValue(20)} color={theme.colors.blush} />
                </PressableScale>
              </WalkerRow>
            ))}
          </WalkerList>
        ) : null}
        <PressableScale onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar">
          <Close>
            <CloseText>Fechar</CloseText>
          </Close>
        </PressableScale>
      </Sheet>
    </Modal>
  );
}
