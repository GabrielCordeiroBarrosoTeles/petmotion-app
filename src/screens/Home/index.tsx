import { router } from 'expo-router';
import { Dog, Flame, Footprints, Play, Route } from 'lucide-react-native';
import { useEffect } from 'react';
import { RFValue } from 'react-native-responsive-fontsize';
import { useSafeInsets } from '@/hooks/useSafeInsets';
import { useTheme } from 'styled-components/native';
import { AchievementBadge } from '@/components/AchievementBadge';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { PackBadge } from '@/components/PackBadge';
import { PetSwitcher } from '@/components/PetSwitcher';
import { ProgressRing } from '@/components/ProgressRing';
import { StatusBarScrim } from '@/components/StatusBarScrim';
import { StatTile } from '@/components/StatTile';
import { BAR_HEIGHT, FAB_SIZE } from '@/components/TabBar/styles';
import { WeatherBanner } from '@/components/WeatherBanner';
import { WeekBars } from '@/components/WeekBars';
import { useFetch } from '@/hooks/useFetch';
import { useStatusBar } from '@/hooks/useStatusBar';
import { useWeather } from '@/hooks/useWeather';
import { api, errorMessage } from '@/services/api';
import { useAuth } from '@/store/auth';
import { usePets, useSelectedPet } from '@/store/pets';
import { spring } from '@/theme/motion';
import { daysUntil, firstName, greeting, km, relativeDay, thousands } from '@/utils/format';
import { HEALTH_META } from '@/utils/health';
import { customToast } from '@/utils/toast';
import { HomeSkeleton } from './SkeletonLoader';
import {
  Badges, Body, Card, NameBlock, OwnerNote, GoalBody, GoalTitle, Greeting, GreetingName, Header, Refresh, RingCaption, RingCenter, RingRow,
  RingSide, Screen, Scroll, SectionHeader, SectionMeta, SectionTitle, StreakChip, StreakText, TileRow, TopRow,
  UpcomingIcon, UpcomingRow, UpcomingTexts, UpcomingTitle, UpcomingWhen,
} from './styles';
import type { UpcomingItemProps } from './types';

function UpcomingItem({ record, index }: UpcomingItemProps) {
  const theme = useTheme();
  const days = daysUntil(record.next_date!);
  const late = days < 0;
  const Icon = HEALTH_META[record.type].icon;

  return (
    <UpcomingRow from={{ opacity: 0, translateX: -12 }} animate={{ opacity: 1, translateX: 0 }} transition={spring({ damping: 16, delay: 80 * index })}>
      <UpcomingIcon $late={late}>
        <Icon size={RFValue(20)} color={theme.colors.ink} strokeWidth={2.4} />
      </UpcomingIcon>
      <UpcomingTexts>
        <UpcomingTitle numberOfLines={1}>{record.title}</UpcomingTitle>
        <UpcomingWhen $late={late}>{late ? `Atrasado há ${-days} ${-days === 1 ? 'dia' : 'dias'}` : relativeDay(record.next_date!)}</UpcomingWhen>
      </UpcomingTexts>
    </UpcomingRow>
  );
}

export function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeInsets();
  useStatusBar('light');

  const user = useAuth((s) => s.user);
  const { pets, loaded, selectedId, load, select } = usePets();
  const pet = useSelectedPet();
  const { weather } = useWeather();

  useEffect(() => {
    load().catch((e) => customToast(errorMessage(e), 'danger'));
  }, [load]);

  const { data: stats, loading, refreshing, refetch } = useFetch(() => api.stats(selectedId!), {
    enabled: !!selectedId,
    deps: [selectedId],
  });

  const tabSpace = BAR_HEIGHT + FAB_SIZE / 2 + insets.bottom + theme.spacing.xl;
  const goal = stats?.today.goal_minutes ?? pet?.daily_goal_minutes ?? 30;
  const minutes = stats?.today.minutes ?? 0;
  const remaining = Math.max(0, goal - minutes);
  const showSkeleton = !loaded || (pets.length > 0 && (loading || !stats));
  const unlocked = stats?.achievements.filter((a) => a.unlocked).length ?? 0;

  return (
    <Screen>
      <Scroll
        refreshControl={
          <Refresh
            refreshing={refreshing}
            onRefresh={() => {
              load().catch(() => undefined);
              refetch('pull');
            }}
          />
        }
      >
        <Header $top={insets.top}>
          <TopRow>
            <NameBlock>
              <Greeting>
                {greeting()},{'\n'}
                <GreetingName>{firstName(user?.name)}</GreetingName>
              </Greeting>
              {user?.is_premium ? <PackBadge tone="onInk" /> : null}
              {pet?.role === 'walker' ? <OwnerNote>Pet da {pet.owner_name}</OwnerNote> : null}
            </NameBlock>
            {stats && stats.streak_days > 0 ? (
              <StreakChip
                from={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={spring({ damping: 9, delay: 300 })}
                accessibilityLabel={`Sequência de ${stats.streak_days} dias passeando`}
              >
                <Flame size={RFValue(16)} color={theme.colors.sun} fill={theme.colors.sun} />
                <StreakText>{stats.streak_days} {stats.streak_days === 1 ? 'dia' : 'dias'}</StreakText>
              </StreakChip>
            ) : null}
          </TopRow>

          {pets.length > 0 ? (
            <PetSwitcher pets={pets} selectedId={selectedId} onSelect={select} onAdd={() => router.push('/pet-form')} />
          ) : null}

          {pet ? (
            <RingRow>
              <ProgressRing progress={stats?.today.goal_progress ?? 0} size={RFValue(150)} stroke={RFValue(14)}>
                <RingCenter>
                  <AnimatedCounter value={minutes} variant="hero" onInk />
                  <RingCaption>de {goal} min</RingCaption>
                </RingCenter>
              </ProgressRing>
              <RingSide>
                <GoalTitle>{remaining === 0 ? `${pet.name} bateu a meta hoje!` : `Faltam ${remaining} min pro ${pet.name}`}</GoalTitle>
                <GoalBody>{remaining === 0 ? 'Mais um passeio sempre cai bem.' : 'Um passeio curto já ajuda a fechar o anel.'}</GoalBody>
                <Button title="Passear" icon={Play} compact onPress={() => router.push('/walk')} />
              </RingSide>
            </RingRow>
          ) : null}
        </Header>

        {loaded && pets.length === 0 ? (
          <EmptyState
            icon={Dog}
            title="Quem vai passear?"
            message="Cadastre seu pet para começar a registrar passeios, cuidados e conquistas."
            actionLabel="Cadastrar meu pet"
            onAction={() => router.push('/pet-form')}
          />
        ) : null}

        {showSkeleton ? <HomeSkeleton withHeader={!loaded} /> : null}

        {stats && !showSkeleton ? (
          <Body $bottom={tabSpace}>
            {weather ? <WeatherBanner weather={weather} /> : null}

            <TileRow>
              <StatTile icon={Route} label="Distância hoje" value={stats.today.distance_meters} format={(n) => km(n, 1)} unit="km" tone="sky" index={0} />
              <StatTile icon={Footprints} label="Passos hoje" value={stats.today.steps} format={(n) => thousands(Math.round(n))} tone="sun" index={1} />
            </TileRow>

            <Card from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={spring({ damping: 16, delay: 150 })}>
              <SectionHeader>
                <SectionTitle>Sua semana</SectionTitle>
                <SectionMeta>meta {goal} min/dia</SectionMeta>
              </SectionHeader>
              <WeekBars days={stats.week} goal={goal} />
            </Card>

            {stats.upcoming_health.length > 0 ? (
              <Card from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={spring({ damping: 16, delay: 220 })}>
                <SectionHeader>
                  <SectionTitle>Próximos cuidados</SectionTitle>
                </SectionHeader>
                {stats.upcoming_health.map((record, i) => (
                  <UpcomingItem key={record.id} record={record} index={i} />
                ))}
              </Card>
            ) : null}

            <SectionHeader>
              <SectionTitle>Conquistas</SectionTitle>
              <SectionMeta>{unlocked} de {stats.achievements.length}</SectionMeta>
            </SectionHeader>
            <Badges>
              {stats.achievements.map((a, i) => (
                <AchievementBadge
                  key={a.code}
                  achievement={a}
                  index={i}
                  onPress={(item) =>
                    customToast(
                      item.unlocked ? `${item.title}: ${item.description}.` : `${item.description} — faltam ${100 - Math.round(item.progress * 100)}%.`,
                      item.unlocked ? 'success' : 'warning',
                    )
                  }
                />
              ))}
            </Badges>
          </Body>
        ) : null}
      </Scroll>
      <StatusBarScrim tone="ink" />
    </Screen>
  );
}
