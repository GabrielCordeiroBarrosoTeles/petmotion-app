import Constants from 'expo-constants';
import { router } from 'expo-router';
import { BellRing, LogOut, Plus, Sparkles, Trash2 } from 'lucide-react-native';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';
import { Button } from '@/components/Button';
import { LegalLinks } from '@/components/LegalLinks';
import { ScreenHeader } from '@/components/ScreenHeader';
import { BAR_HEIGHT } from '@/components/TabBar/styles';
import type { Pet } from '@/services/types';
import { useAuth } from '@/store/auth';
import { usePets, useSelectedPet } from '@/store/pets';
import { useSettings } from '@/store/settings';
import { useWalk } from '@/store/walk';
import { spring } from '@/theme/motion';
import { ensureNotificationPermission, setDailyWalkReminder } from '@/utils/notifications';
import { customToast } from '@/utils/toast';
import { PetRow } from './PetRow';
import {
  Content, Divider, Initials, InitialsText, Panel, Screen, Scroll, Section, SectionTitle, UserCard, UserEmail, UserName,
  UserTexts, Version,
} from './styles';
import { SettingRow } from './SettingRow';

const initialsOf = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');

export function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);
  const pets = usePets((s) => s.pets);
  const pet = useSelectedPet();
  const { demoMode, walkReminder, setDemoMode, setWalkReminder } = useSettings();

  const editPet = (p: Pet) => router.push({ pathname: '/pet-form', params: { id: String(p.id) } });

  const toggleReminder = async (value: boolean) => {
    if (value && !(await ensureNotificationPermission())) {
      customToast('Permita notificações nas configurações para receber o lembrete.', 'warning');
      return;
    }
    setWalkReminder(value);
    await setDailyWalkReminder(value, pet?.name ?? 'Seu pet');
    if (value) customToast('Fechado! Todo dia às 18h a gente te chama.', 'success');
  };

  const confirmSignOut = () =>
    Alert.alert('Sair da conta?', 'Você pode entrar de novo quando quiser.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          useWalk.getState().reset();
          signOut();
        },
      },
    ]);

  return (
    <Screen $top={insets.top}>
      <ScreenHeader title="Perfil" />
      <Scroll>
        <Content $bottom={BAR_HEIGHT + insets.bottom + theme.spacing.xxl}>
          <UserCard from={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={spring({ damping: 15 })}>
            <Initials>
              <InitialsText>{initialsOf(user?.name)}</InitialsText>
            </Initials>
            <UserTexts>
              <UserName numberOfLines={1}>{user?.name}</UserName>
              <UserEmail numberOfLines={1}>{user?.email}</UserEmail>
            </UserTexts>
          </UserCard>

          <Section>
            <SectionTitle>Seus pets</SectionTitle>
            {pets.map((p, i) => (
              <PetRow key={p.id} pet={p} index={i} onPress={editPet} />
            ))}
            <Button title="Adicionar pet" icon={Plus} variant="ghost" onPress={() => router.push('/pet-form')} />
          </Section>

          <Section>
            <SectionTitle>Preferências</SectionTitle>
            <Panel>
              <SettingRow
                icon={Sparkles}
                title="Modo apresentação"
                description="Simula o GPS andando em círculo. Ideal para demonstrar em sala, onde o sinal é fraco."
                value={demoMode}
                onChange={setDemoMode}
              />
              <Divider />
              <SettingRow
                icon={BellRing}
                title="Lembrete de passeio"
                description="Uma notificação todo dia às 18h."
                value={walkReminder}
                onChange={toggleReminder}
              />
            </Panel>
          </Section>

          <Button title="Sair da conta" icon={LogOut} variant="ghost" onPress={confirmSignOut} />
          <Button title="Excluir minha conta" icon={Trash2} variant="ghost" onPress={() => router.push('/delete-account')} />
          <LegalLinks prefix="Leia os" />
          <Version>PetMotion {Constants.expoConfig?.version ?? '1.0.0'}</Version>
        </Content>
      </Scroll>
    </Screen>
  );
}
