import { router, useLocalSearchParams } from 'expo-router';
import { Camera, Check, Share2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useSafeInsets } from '@/hooks/useSafeInsets';
import { Button } from '@/components/Button';
import { Confetti } from '@/components/Confetti';
import { WalkShareCard } from '@/components/WalkShareCard';
import { useFetch } from '@/hooks/useFetch';
import { useShareView } from '@/hooks/useShareView';
import { api } from '@/services/api';
import { useAuth } from '@/store/auth';
import { useSelectedPet } from '@/store/pets';
import { spring } from '@/theme/motion';
import { celebrate } from '@/utils/haptics';
import { joinNames, km } from '@/utils/format';
import { customToast } from '@/utils/toast';
import { NewAchievement } from './NewAchievement';
import { WalkSummarySkeleton } from './SkeletonLoader';
import { Buttons, Capture, CardWrap, Content, Heading, Screen, Scroll, Subtitle, Title } from './styles';
import type { SummaryData, SummaryParams } from './types';

export function WalkSummaryScreen() {
  const insets = useSafeInsets();
  const { id, before } = useLocalSearchParams<SummaryParams>();
  const pet = useSelectedPet();
  const isPremium = useAuth((s) => !!s.user?.is_premium);
  const { ref, share, sharing } = useShareView();
  const [burst, setBurst] = useState(0);

  const { data, loading, error } = useFetch<SummaryData>(async () => {
    const walk = await api.walk(Number(id));
    const stats = await api.stats(walk.pet_id);
    return { walk, stats };
  }, { deps: [id] });

  useEffect(() => {
    if (!data) return;
    setBurst(Date.now());
    celebrate();
  }, [data]);

  useEffect(() => {
    if (error) customToast(error, 'danger');
  }, [error]);

  const unlockedBefore = new Set((before ?? '').split(',').filter(Boolean));
  const fresh = before !== undefined && data ? data.stats.achievements.filter((a) => a.unlocked && !unlockedBefore.has(a.code)) : [];
  const petForCard = data?.walk.pet ?? pet;
  const companions = data?.walk.companions ?? [];
  const namesWith = (main: string) => joinNames([main, ...companions.map((c) => c.name)]);
  const goalHit = data ? data.stats.today.goal_progress >= 1 : false;

  return (
    <Screen>
      {loading || !data || !petForCard ? (
        <WalkSummarySkeleton top={insets.top} />
      ) : (
        <Scroll>
          <Content $top={insets.top} $bottom={insets.bottom}>
            <Heading from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={spring({ damping: 14 })}>
              <Title>{goalHit ? 'Meta do dia\nbatida!' : 'Que passeio!'}</Title>
              <Subtitle>
                {namesWith(petForCard.name)} {companions.length ? 'andaram' : 'andou'} {km(data.walk.distance_meters)} km
                {data.stats.streak_days > 1 ? ` e ${companions.length ? 'mantiveram' : 'manteve'} a sequência de ${data.stats.streak_days} dias.` : '.'}
              </Subtitle>
            </Heading>

            <CardWrap from={{ opacity: 0, scale: 0.9, rotate: '-3deg' }} animate={{ opacity: 1, scale: 1, rotate: '0deg' }} transition={spring({ damping: 13, delay: 200 })}>
              <Capture ref={ref} collapsable={false}>
                <WalkShareCard walk={data.walk} pet={petForCard} premium={isPremium} map />
              </Capture>
            </CardWrap>

            {fresh.map((a, i) => (
              <NewAchievement key={a.code} achievement={a} index={i} />
            ))}

            <Buttons>
              <Button title="Criar foto do passeio" icon={Camera} onPress={() => router.push({ pathname: '/walk-photo', params: { id: String(data.walk.id) } })} />
              <Button title="Compartilhar card" icon={Share2} variant="ink" onPress={() => share(companions.length ? `Passeio de ${namesWith(petForCard.name)}` : `Passeio do ${petForCard.name}`)} loading={sharing} />
              <Button title="Concluir" icon={Check} variant="ghost" onPress={() => router.replace('/home')} />
            </Buttons>
          </Content>
        </Scroll>
      )}
      <Confetti burstKey={burst} />
    </Screen>
  );
}
