import { router, useLocalSearchParams } from 'expo-router';
import { Camera, ChevronLeft, Clock, Droplet, Droplets, Footprints, Gauge, Leaf, Route, Share2, Thermometer, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useSafeInsets } from '@/hooks/useSafeInsets';
import { useTheme } from 'styled-components/native';
import { Button } from '@/components/Button';
import { PressableScale } from '@/components/PressableScale';
import { RouteMap } from '@/components/RouteMap';
import { StatTile } from '@/components/StatTile';
import { WalkShareCard } from '@/components/WalkShareCard';
import { useFetch } from '@/hooks/useFetch';
import { useShareView } from '@/hooks/useShareView';
import { api, errorMessage } from '@/services/api';
import type { WalkEvent } from '@/services/types';
import { useAuth } from '@/store/auth';
import { useSelectedPet } from '@/store/pets';
import { fullDateLabel, km, minutesLabel, pace, thousands, timeLabel } from '@/utils/format';
import { confirmAction } from '@/utils/confirm';
import { customToast } from '@/utils/toast';
import { WalkDetailSkeleton } from './SkeletonLoader';
import { BackButton, BackWrap, Body, Buttons, Capture, Grid, MapBox, Screen, Scroll, SectionTitle, Subtitle, Title } from './styles';
import type { WalkDetailParams } from './types';

const countEvents = (events: WalkEvent[], type: WalkEvent['type']) => events.filter((e) => e.type === type).length;

export function WalkDetailScreen() {
  const theme = useTheme();
  const insets = useSafeInsets();
  const { height } = useWindowDimensions();
  const { id } = useLocalSearchParams<WalkDetailParams>();
  const pet = useSelectedPet();
  const isPremium = useAuth((s) => !!s.user?.is_premium);
  const { ref, share, sharing } = useShareView();
  const [deleting, setDeleting] = useState(false);
  const mapHeight = height * 0.42;

  const { data: walk, loading, error } = useFetch(() => api.walk(Number(id)), { deps: [id] });

  useEffect(() => {
    if (error) customToast(error, 'danger');
  }, [error]);

  const confirmDelete = async () => {
    const ok = await confirmAction({
      title: 'Excluir passeio?',
      message: 'O trajeto e as marcações serão apagados para sempre.',
      confirmLabel: 'Excluir passeio',
      icon: Trash2,
    });
    if (!ok) return;
    setDeleting(true);
    try {
      await api.deleteWalk(Number(id));
      customToast('Passeio excluído.', 'success');
      router.back();
    } catch (e) {
      customToast(errorMessage(e), 'danger');
      setDeleting(false);
    }
  };

  const cardPet = walk?.pet ?? pet;

  return (
    <Screen>
      {loading || !walk || !cardPet ? (
        <WalkDetailSkeleton mapHeight={mapHeight} />
      ) : (
        <Scroll>
          <MapBox $height={mapHeight}>
            <RouteMap points={walk.points} events={walk.events} edgePadding={{ top: insets.top + 60, right: 40, bottom: 60, left: 40 }} />
          </MapBox>
          <Body $bottom={insets.bottom}>
            <Title>{km(walk.distance_meters)} km com {cardPet.name}</Title>
            <Subtitle>{fullDateLabel(walk.started_at)} · {timeLabel(walk.started_at)}</Subtitle>

            <Grid>
              <StatTile icon={Clock} label="Duração" value={Math.round(walk.duration_seconds / 60)} format={(n) => minutesLabel(Math.round(n))} index={0} />
              <StatTile icon={Gauge} label="Ritmo" value={walk.duration_seconds} format={() => pace(walk.duration_seconds, walk.distance_meters)} unit="min/km" index={1} />
              <StatTile icon={Footprints} label="Passos" value={walk.steps} format={(n) => thousands(Math.round(n))} tone="sun" index={2} />
              <StatTile
                icon={Thermometer}
                label="Temperatura"
                value={walk.temperature_c ?? 0}
                format={(n) => (walk.temperature_c === null ? '--' : String(Math.round(n)))}
                unit="°C"
                tone="sky"
                index={3}
              />
              <StatTile icon={Droplet} label="Xixi" value={countEvents(walk.events, 'pee')} tone="sun" index={4} />
              <StatTile icon={Leaf} label="Cocô" value={countEvents(walk.events, 'poop')} index={5} />
              <StatTile icon={Droplets} label="Água" value={countEvents(walk.events, 'water')} tone="sky" index={6} />
              <StatTile icon={Route} label="Pontos de GPS" value={walk.points.length} index={7} />
            </Grid>

            <SectionTitle>Card para compartilhar</SectionTitle>
            <Capture ref={ref} collapsable={false}>
              <WalkShareCard walk={walk} pet={cardPet} premium={isPremium} />
            </Capture>

            <Buttons>
              <Button title="Criar foto do passeio" icon={Camera} onPress={() => router.push({ pathname: '/walk-photo', params: { id: String(walk.id) } })} />
              <Button title="Compartilhar card" icon={Share2} variant="ink" onPress={() => share(`Passeio do ${cardPet.name}`)} loading={sharing} />
              <Button title="Excluir passeio" icon={Trash2} variant="danger" onPress={confirmDelete} loading={deleting} />
            </Buttons>
          </Body>
        </Scroll>
      )}

      <BackWrap $top={insets.top}>
        <PressableScale onPress={() => router.back()} accessibilityLabel="Voltar">
          <BackButton>
            <ChevronLeft size={RFValue(24)} color={theme.colors.ink} />
          </BackButton>
        </PressableScale>
      </BackWrap>
    </Screen>
  );
}
