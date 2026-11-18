import { router } from 'expo-router';
import { HeartPulse, Plus, Trash2 } from 'lucide-react-native';
import { useMemo } from 'react';
import { useSafeInsets } from '@/hooks/useSafeInsets';
import { useTheme } from 'styled-components/native';
import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { BAR_HEIGHT, FAB_SIZE } from '@/components/TabBar/styles';
import { useFetch } from '@/hooks/useFetch';
import { api, errorMessage } from '@/services/api';
import type { HealthRecord } from '@/services/types';
import { useSelectedPet } from '@/store/pets';
import { daysUntil } from '@/utils/format';
import { confirmAction } from '@/utils/confirm';
import { customToast } from '@/utils/toast';
import { DueCard } from './DueCard';
import { HealthSkeleton } from './SkeletonLoader';
import { DueRow, Hint, Refresh, Screen, Scroll, Section, SectionTitle, Timeline } from './styles';
import { TimelineItem } from './TimelineItem';
import type { HealthSections } from './types';

export function HealthScreen() {
  const theme = useTheme();
  const insets = useSafeInsets();
  const pet = useSelectedPet();

  // a carteirinha fica com o pai/mãe do pet: a API nem responde para quem só passeia
  const walkerPet = pet?.role === 'walker';

  const { data, loading, refreshing, refetch, setData } = useFetch(() => api.health(pet!.id), {
    enabled: !!pet && !walkerPet,
    deps: [pet?.id],
  });

  const sections = useMemo<HealthSections>(() => {
    const records = data ?? [];
    return {
      due: records
        .filter((r) => r.next_date && daysUntil(r.next_date) >= -30)
        .sort((a, b) => a.next_date!.localeCompare(b.next_date!)),
      history: [...records].sort((a, b) => b.date.localeCompare(a.date)),
    };
  }, [data]);

  const confirmDelete = async (record: HealthRecord) => {
    const ok = await confirmAction({
      title: 'Excluir registro?',
      message: `"${record.title}" será removido do histórico.`,
      confirmLabel: 'Excluir',
      icon: Trash2,
    });
    if (!ok) return;
    const previous = data;
    setData((prev) => prev?.filter((r) => r.id !== record.id) ?? null);
    try {
      await api.deleteHealth(record.id);
      customToast('Registro excluído.', 'success');
    } catch (e) {
      setData(() => previous);
      customToast(errorMessage(e), 'danger');
    }
  };

  const bottom = BAR_HEIGHT + FAB_SIZE / 2 + insets.bottom + theme.spacing.xl;

  return (
    <Screen $top={insets.top}>
      <ScreenHeader
        title="Saúde"
        subtitle={pet ? `Cuidados do ${pet.name}` : undefined}
        action={pet && !walkerPet ? { icon: Plus, label: 'Adicionar cuidado', onPress: () => router.push('/health-form') } : undefined}
      />
      {walkerPet ? (
        <EmptyState icon={HeartPulse} title={`A saúde do ${pet.name} fica com ${pet.owner_name}.`} message={`Só quem cadastrou o ${pet.name} vê vacinas e remédios. Você cuida dos passeios.`} />
      ) : loading ? (
        <HealthSkeleton />
      ) : (
        <Scroll
          contentContainerStyle={{ paddingBottom: bottom }}
          refreshControl={<Refresh refreshing={refreshing} onRefresh={() => refetch('pull')} />}
        >
          {sections.history.length === 0 ? (
            <EmptyState
              icon={HeartPulse}
              title="Carteirinha vazia"
              message={pet ? `Registre vacinas, vermífugos e consultas do ${pet.name}. A gente te lembra um dia antes.` : 'Cadastre seu pet primeiro.'}
              actionLabel={pet ? 'Adicionar cuidado' : 'Cadastrar pet'}
              onAction={() => router.push(pet ? '/health-form' : '/pet-form')}
            />
          ) : null}

          {sections.due.length > 0 ? (
            <Section>
              <SectionTitle>Próximas doses</SectionTitle>
              <DueRow>
                {sections.due.map((r, i) => (
                  <DueCard key={r.id} record={r} index={i} />
                ))}
              </DueRow>
            </Section>
          ) : null}

          {sections.history.length > 0 ? (
            <Section>
              <SectionTitle>Histórico</SectionTitle>
              <Hint>Toque e segure um registro para excluir.</Hint>
              <Timeline>
                {sections.history.map((r, i) => (
                  <TimelineItem key={r.id} record={r} index={i} isLast={i === sections.history.length - 1} onLongPress={confirmDelete} />
                ))}
              </Timeline>
            </Section>
          ) : null}
        </Scroll>
      )}
    </Screen>
  );
}
