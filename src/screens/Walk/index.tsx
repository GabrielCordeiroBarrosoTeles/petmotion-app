import { router } from 'expo-router';
import * as Location from 'expo-location';
import { ChevronDown, Droplet, Droplets, Flag, Leaf, Pause, Play, Satellite, Sparkles, Thermometer, Trash2, X } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RFValue } from 'react-native-responsive-fontsize';
import { useSafeInsets } from '@/hooks/useSafeInsets';
import { useTheme } from 'styled-components/native';
import { Countdown } from '@/components/Countdown';
import { HoldToConfirm } from '@/components/HoldToConfirm';
import { PressableScale } from '@/components/PressableScale';
import { RouteMap } from '@/components/RouteMap';
import { useElapsed } from '@/hooks/useElapsed';
import { useLiveBroadcast } from '@/hooks/useLiveBroadcast';
import { useStatusBar } from '@/hooks/useStatusBar';
import { useWeather } from '@/hooks/useWeather';
import { api, errorMessage } from '@/services/api';
import type { WalkEventType } from '@/services/types';
import { usePets, useSelectedPet } from '@/store/pets';
import { useSettings } from '@/store/settings';
import { MIN_WALK_M, useWalk } from '@/store/walk';
import { useWearCommand } from '@/store/wearCommand';
import { spring, timing } from '@/theme/motion';
import { duration, joinNames, km, pace, thousands } from '@/utils/format';
import { clearWalkNotification, ensureNotificationPermission, showWalkNotification } from '@/utils/notifications';
import { confirmAction } from '@/utils/confirm';
import { customToast } from '@/utils/toast';
import { CrewPicker } from './CrewPicker';
import { QuickAction } from './QuickAction';
import {
  Actions, Chip, ChipText, ControlFlex, Controls, Distance, DistanceValue, Grabber, HeadMain, HeadRow, LiveDot, LiveRow,
  MapArea, PauseButton, Pills, ReadyBody, ReadyTitle, RoundButton, SavingOverlay, SavingText, Screen, Sheet, Spacer,
  Spinner, StartBall, StartLabel, StartRow, StatLabel, StatPill, StatValue, Timer, TimerCaption, TopBar,
} from './styles';
import type { WalkPhase } from './types';

const QUICK_ACTIONS = [
  { type: 'pee' as const, label: 'Xixi', icon: Droplet },
  { type: 'poop' as const, label: 'Cocô', icon: Leaf },
  { type: 'water' as const, label: 'Água', icon: Droplets },
];

export function WalkScreen() {
  const theme = useTheme();
  const insets = useSafeInsets();
  useStatusBar('dark');

  const pet = useSelectedPet();
  const pets = usePets((s) => s.pets);
  const demoMode = useSettings((s) => s.demoMode);
  const { weather, coords } = useWeather();
  const walk = useWalk();
  const { elapsedSeconds } = useElapsed();
  const live = useLiveBroadcast();
  const [phase, setPhase] = useState<WalkPhase>(walk.status === 'idle' ? 'ready' : 'tracking');
  const [saving, setSaving] = useState(false);
  const unlockedBefore = useRef<string[]>([]);
  // quem vai junto: começa só com o pet selecionado; some da lista quem saiu da conta
  const [picked, setPicked] = useState<number[] | null>(null);
  const idsToPets = (ids: number[]) => ids.flatMap((id) => pets.find((p) => p.id === id) ?? []);
  // na ordem da lista, não na do toque: o nome do passeio fica sempre igual
  const pickedIds = picked ?? (pet ? [pet.id] : []);
  const pickedPets = pets.filter((p) => pickedIds.includes(p.id));
  // se todos os marcados saíram da lista, volta para o pet selecionado
  const crew = pickedPets.length ? pickedPets : pet ? [pet] : [];
  const crewIds = crew.map((p) => p.id);
  const walkingNames = joinNames((phase === 'tracking' ? idsToPets(walk.petIds) : crew).map((p) => p.name));
  const toggleCrew = (id: number) =>
    setPicked((prev) => {
      const current = prev ?? crewIds;
      return current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    });

  useEffect(() => {
    if (!pet) {
      customToast('Cadastre um pet antes de passear.', 'warning');
      router.replace('/pet-form');
    }
  }, [pet]);

  // Notificação fixa com o andamento do passeio
  useEffect(() => {
    if (walk.status !== 'running' || !walkingNames) return;
    const body = `${duration(elapsedSeconds)} · ${km(walk.distance)} km · ${thousands(walk.steps)} passos`;
    if (elapsedSeconds % 15 === 0) showWalkNotification(walkingNames, body);
  }, [elapsedSeconds, walk.status, walk.distance, walk.steps, walkingNames]);

  const requestStart = async () => {
    if (!pet) return;
    if (!demoMode) {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        customToast('Precisamos da localização para desenhar o trajeto. Ative nas configurações ou use o modo apresentação no Perfil.', 'danger');
        return;
      }
    }
    ensureNotificationPermission().catch(() => undefined);
    api.stats(pet.id)
      .then((s) => {
        unlockedBefore.current = s.achievements.filter((a) => a.unlocked).map((a) => a.code);
      })
      .catch(() => undefined);
    if (weather?.level === 'danger') customToast(weather.message, 'warning');
    setPhase('countdown');
  };

  const startTracking = useCallback(async () => {
    // os pets podem ter sido removidos durante a contagem: segue só com quem sobrou ou volta para o início
    if (!crewIds.length) {
      setPhase('ready');
      return;
    }
    setPhase('tracking');
    try {
      await useWalk.getState().start({ petIds: crewIds, demo: demoMode, temperature: weather?.air_c ?? null });
      // pets de passeio: o pai/mãe de cada um acompanha ao vivo
      live.start(crewIds);
    } catch (e) {
      customToast('Não foi possível iniciar o GPS. Tente o modo apresentação no Perfil.', 'danger');
      useWalk.getState().reset();
      setPhase('ready');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crewIds.join(','), demoMode, weather]);

  const finish = async () => {
    const payload = useWalk.getState().finish();
    if (!payload) return;
    if (payload.points.length < 2 || payload.distance_meters < MIN_WALK_M) {
      customToast('Passeio muito curto para salvar. Ande mais um pouquinho!', 'warning');
      useWalk.getState().resume();
      return;
    }
    setSaving(true);
    try {
      const saved = await api.createWalk(payload);
      live.finish(saved);
      await clearWalkNotification();
      useWalk.getState().reset();
      router.replace({ pathname: '/walk-summary', params: { id: String(saved.id), before: unlockedBefore.current.join(',') } });
    } catch (e) {
      customToast(errorMessage(e), 'danger');
      setSaving(false);
    }
  };

  // desistiu: nada é salvo, nem conta para meta, sequência ou conquistas
  const discard = async () => {
    const ok = await confirmAction({
      title: 'Descartar passeio?',
      message: 'O tempo, o trajeto e as marcações deste passeio não serão salvos.',
      confirmLabel: 'Descartar',
      icon: Trash2,
    });
    if (!ok) return;
    live.cancel();
    useWalk.getState().reset();
    await clearWalkNotification();
    customToast('Passeio descartado.', 'warning');
    router.back();
  };

  // começar/finalizar pedidos pelo relógio (a contagem e o salvamento vivem nesta tela)
  const wearCommand = useWearCommand((st) => st.command);
  useEffect(() => {
    if (!wearCommand) return;
    useWearCommand.getState().clear();
    if (wearCommand.type === 'start' && phase === 'ready') requestStart();
    if (wearCommand.type === 'finish' && phase === 'tracking') finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wearCommand]);

  const addEvent = (type: WalkEventType) => useWalk.getState().addEvent(type);
  const counts = (type: WalkEventType) => walk.events.filter((e) => e.type === type).length;
  const mapPoints = walk.points.length ? walk.points : coords ? [coords] : [];
  const tracking = phase === 'tracking';

  return (
    <Screen>
      <MapArea>
        <RouteMap points={mapPoints} events={walk.events} follow interactive={!tracking} />

        <TopBar $top={insets.top}>
          <PressableScale onPress={() => router.back()} accessibilityLabel={tracking ? 'Minimizar passeio' : 'Fechar'}>
            <RoundButton>
              <ChevronDown size={RFValue(24)} color={theme.colors.ink} />
            </RoundButton>
          </PressableScale>
          {tracking && !walk.gpsReady ? (
            <Chip $tone="ink" from={{ opacity: 0.5 }} animate={{ opacity: 1 }} transition={timing({ duration: 700, loop: true, repeatReverse: true })}>
              <Satellite size={RFValue(14)} color={theme.colors.primary} />
              <ChipText $onInk>Procurando GPS…</ChipText>
            </Chip>
          ) : null}
          <Spacer />
          {tracking ? (
            <PressableScale onPress={discard} accessibilityLabel="Descartar passeio">
              <RoundButton>
                <X size={RFValue(22)} color={theme.colors.ink} />
              </RoundButton>
            </PressableScale>
          ) : null}
          {demoMode ? (
            <Chip $tone="sun">
              <Sparkles size={RFValue(14)} color={theme.colors.ink} />
              <ChipText>Simulado</ChipText>
            </Chip>
          ) : null}
          {weather ? (
            <Chip>
              <Thermometer size={RFValue(14)} color={theme.colors.ink} />
              <ChipText>{Math.round(weather.air_c)}°C</ChipText>
            </Chip>
          ) : null}
        </TopBar>
      </MapArea>

      <Sheet $bottom={insets.bottom} from={{ translateY: 200 }} animate={{ translateY: 0 }} transition={spring({ damping: 18 })}>
        <Grabber />
        {tracking ? (
          <>
            <HeadRow>
              <HeadMain>
                <Timer accessibilityLabel={`Tempo de passeio ${duration(elapsedSeconds)}`}>{duration(elapsedSeconds)}</Timer>
                <LiveRow>
                  {walk.status === 'running' ? (
                    <LiveDot from={{ opacity: 1 }} animate={{ opacity: 0.25 }} transition={timing({ duration: 800, loop: true, repeatReverse: true })} />
                  ) : null}
                  <TimerCaption>{walk.status === 'paused' ? 'Pausado' : `Passeando com ${walkingNames}`}</TimerCaption>
                </LiveRow>
              </HeadMain>
              <Distance>
                <DistanceValue>{km(walk.distance)}</DistanceValue>
                <StatLabel>km</StatLabel>
              </Distance>
            </HeadRow>
            <Pills>
              <StatPill>
                <StatValue>{thousands(walk.steps)}</StatValue>
                <StatLabel>passos</StatLabel>
              </StatPill>
              <StatPill>
                <StatValue>{pace(elapsedSeconds, walk.distance)}</StatValue>
                <StatLabel>min/km</StatLabel>
              </StatPill>
            </Pills>
            <Actions>
              {QUICK_ACTIONS.map((a) => (
                <QuickAction key={a.type} {...a} count={counts(a.type)} onPress={addEvent} />
              ))}
            </Actions>
            <Controls>
              <PressableScale
                onPress={() => (walk.status === 'running' ? walk.pause() : walk.resume())}
                accessibilityLabel={walk.status === 'running' ? 'Pausar passeio' : 'Retomar passeio'}
              >
                <PauseButton>
                  {walk.status === 'running' ? (
                    <Pause size={RFValue(24)} color={theme.colors.ink} fill={theme.colors.ink} />
                  ) : (
                    <Play size={RFValue(24)} color={theme.colors.ink} fill={theme.colors.ink} />
                  )}
                </PauseButton>
              </PressableScale>
              <ControlFlex>
                <HoldToConfirm label="Segure para finalizar" holdingLabel="Finalizando…" icon={Flag} onConfirm={finish} />
              </ControlFlex>
            </Controls>
          </>
        ) : (
          <>
            <ReadyTitle>Pronto pra sair{'\n'}com {walkingNames}?</ReadyTitle>
            <ReadyBody>
              {weather ? `${weather.message} ` : ''}
              Durante o passeio, toque em Xixi, Cocô ou Água para marcar no mapa.
            </ReadyBody>
            {pets.length > 1 ? <CrewPicker pets={pets} checkedIds={crewIds} onToggle={toggleCrew} /> : null}
            <StartRow>
              <PressableScale scaleTo={0.9} haptic="none" onPress={requestStart} accessibilityLabel="Começar passeio" disabled={phase === 'countdown'}>
                <StartBall
                  from={{ scale: 1 }}
                  animate={{ scale: 1.06 }}
                  transition={timing({ duration: 900, loop: true, repeatReverse: true })}
                >
                  <StartLabel>Começar</StartLabel>
                </StartBall>
              </PressableScale>
            </StartRow>
          </>
        )}
      </Sheet>

      <Countdown active={phase === 'countdown'} onDone={startTracking} />

      {saving ? (
        <SavingOverlay>
          <Spinner />
          <SavingText>Salvando o passeio…</SavingText>
        </SavingOverlay>
      ) : null}
    </Screen>
  );
}
