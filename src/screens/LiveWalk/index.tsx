import { router, useLocalSearchParams } from 'expo-router';
import { ChevronDown, Droplet, Droplets, Leaf, MapPinOff, Route, Trash2 } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components/native';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { PressableScale } from '@/components/PressableScale';
import { RouteMap } from '@/components/RouteMap';
import { useSafeInsets } from '@/hooks/useSafeInsets';
import { useStatusBar } from '@/hooks/useStatusBar';
import { api, errorMessage } from '@/services/api';
import type { LiveWalk } from '@/services/types';
import { useLive } from '@/store/live';
import { usePets } from '@/store/pets';
import { spring, timing } from '@/theme/motion';
import { duration, joinNames, km, thousands } from '@/utils/format';
import { customToast } from '@/utils/toast';
import { LiveWalkSkeleton } from './SkeletonLoader';
import {
  Caption, Center, CountDot, Distance, DistanceValue, HeadMain, HeadRow, LiveDot, LiveRow, MapArea, Pills, RoundButton,
  Screen, Sheet, StatLabel, StatPill, StatValue, Timer, Title, TopBar,
} from './styles';
import type { LiveCountProps, LiveWalkParams } from './types';

const COUNTS = [
  { type: 'pee' as const, label: 'xixi', icon: Droplet },
  { type: 'poop' as const, label: 'cocô', icon: Leaf },
  { type: 'water' as const, label: 'água', icon: Droplets },
];

function LiveCount({ type, label, icon: Icon, count }: LiveCountProps) {
  const theme = useTheme();
  return (
    <StatPill accessibilityLabel={`${count} ${label}`}>
      <CountDot $type={type}>
        <Icon size={RFValue(12)} color={theme.colors.ink} strokeWidth={2.6} />
      </CountDot>
      <StatValue>{count}</StatValue>
    </StatPill>
  );
}

/** Tempo do passeio: o último valor do servidor + o que passou desde então (se ainda está andando). */
function useLiveSeconds(live: LiveWalk | undefined): number {
  const running = live?.status === 'running';
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (!running) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);

  if (!live) return 0;
  const since = running ? Math.max(0, now - Date.parse(live.at)) : 0;
  return Math.floor((live.elapsed_ms + since) / 1000);
}

/** Pai/mãe de pet acompanhando o passeio de agora (`/live/{petId}`). */
export function LiveWalkScreen() {
  const theme = useTheme();
  const insets = useSafeInsets();
  useStatusBar('dark');
  const { id } = useLocalSearchParams<LiveWalkParams>();
  const petId = Number(id);
  const petName = usePets((s) => s.pets.find((p) => p.id === petId)?.name);
  const live = useLive((s) => s.byPet[petId]);
  const [loading, setLoading] = useState(true);
  const seconds = useLiveSeconds(live);

  // o GET traz a rota inteira; daí em diante os eventos do socket chegam pelo useOwnerLive
  const load = useCallback(async () => {
    try {
      const before = useLive.getState().byPet[petId];
      const state = await api.live(petId);
      useLive.getState().reconcile(petId, state, before);
    } catch (e) {
      customToast(errorMessage(e), 'danger');
    } finally {
      setLoading(false);
    }
  }, [petId]);

  // ao abrir e ao voltar para o app (com o socket fora, eventos podem ter se perdido)
  useEffect(() => {
    load();
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') load();
    });
    return () => sub.remove();
  }, [load]);

  // o evento só levou os últimos pontos: busca a rota completa
  useEffect(() => {
    if (live?.truncated) load();
  }, [live?.truncated, load]);

  const close = (
    <TopBar $top={insets.top}>
      <PressableScale onPress={() => router.back()} accessibilityLabel="Fechar">
        <RoundButton>
          <ChevronDown size={RFValue(24)} color={theme.colors.ink} />
        </RoundButton>
      </PressableScale>
    </TopBar>
  );

  if (loading) {
    return (
      <Screen>
        <LiveWalkSkeleton bottom={insets.bottom} />
        {close}
      </Screen>
    );
  }

  if (!live || live.status === 'cancelled') {
    const cancelled = live?.status === 'cancelled';
    return (
      <Screen>
        <Center $top={insets.top}>
          <EmptyState
            icon={cancelled ? Trash2 : MapPinOff}
            title={cancelled ? 'O passeio foi descartado' : 'Nenhum passeio agora'}
            message={
              cancelled
                ? 'Quem estava passeando desistiu deste passeio, então nada foi salvo.'
                : `Quando alguém sair para passear com ${petName ?? 'seu pet'}, você acompanha por aqui.`
            }
            actionLabel="Voltar"
            onAction={() => router.back()}
          />
        </Center>
        {close}
      </Screen>
    );
  }

  const finished = live.status === 'finished';
  const names = joinNames(live.pet_names);

  return (
    <Screen>
      <MapArea>
        {/* o GET e o mergeLive sempre trazem a rota */}
        <RouteMap points={live.points!} follow={!finished} />
        {close}
      </MapArea>

      <Sheet $bottom={insets.bottom} from={{ translateY: 200 }} animate={{ translateY: 0 }} transition={spring({ damping: 18 })}>
        <HeadRow>
          <HeadMain>
            {finished ? (
              <Title>Passeio concluído</Title>
            ) : (
              <Timer accessibilityLabel={`Tempo de passeio ${duration(seconds)}`}>{duration(seconds)}</Timer>
            )}
            <LiveRow>
              {live.status === 'running' ? (
                <LiveDot from={{ opacity: 1 }} animate={{ opacity: 0.25 }} transition={timing({ duration: 800, loop: true, repeatReverse: true })} />
              ) : null}
              <Caption numberOfLines={2}>
                {live.status === 'paused' ? 'Pausado · ' : ''}
                {names} com {live.walker.name}
                {finished ? ` · ${duration(seconds)}` : ''}
              </Caption>
            </LiveRow>
          </HeadMain>
          <Distance>
            <DistanceValue>{km(live.distance)}</DistanceValue>
            <StatLabel>km</StatLabel>
          </Distance>
        </HeadRow>

        <Pills>
          <StatPill>
            <StatValue>{thousands(live.steps)}</StatValue>
            <StatLabel>passos</StatLabel>
          </StatPill>
          {COUNTS.map((c) => (
            <LiveCount key={c.type} {...c} count={live.counts[c.type]} />
          ))}
        </Pills>

        {finished ? (
          <Button title="Ver passeio" icon={Route} onPress={() => router.replace(`/walks/${live.walk_id}`)} />
        ) : null}
      </Sheet>
    </Screen>
  );
}
