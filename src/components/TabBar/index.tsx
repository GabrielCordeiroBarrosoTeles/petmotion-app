import { router } from 'expo-router';
import { Footprints, HeartPulse, House, Route, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useSafeInsets } from '@/hooks/useSafeInsets';
import { useTheme } from 'styled-components/native';
import { useElapsed } from '@/hooks/useElapsed';
import { useWalk } from '@/store/walk';
import { spring } from '@/theme/motion';
import { duration } from '@/utils/format';
import { select, thump } from '@/utils/haptics';
import { PressableScale } from '../PressableScale';
import { TennisBall } from '../TennisBall';
import { BarBackground } from './BarBackground';
import {
  BAR_HEIGHT, Dot, FAB_SIZE, FabWrap, Gap, IconLift, CRADLE_RADIUS, Row, Side, Slot, TabLabel, TabLabelText, Timer,
  TimerText, Wrapper,
} from './styles';
import type { TabBarProps, TabMeta } from './types';

const META: Record<string, TabMeta> = {
  home: { label: 'Início', icon: House },
  history: { label: 'Passeios', icon: Route },
  health: { label: 'Saúde', icon: HeartPulse },
  profile: { label: 'Perfil', icon: UserRound },
};

/** 2 abas | bola de passear na elevação do centro | 2 abas */
const LEFT = ['home', 'history'];
const RIGHT = ['health', 'profile'];

export function TabBar({ state, emitter, navigateToTab }: TabBarProps) {
  const theme = useTheme();
  const insets = useSafeInsets();
  const walkStatus = useWalk((s) => s.status);
  const { elapsedSeconds } = useElapsed();
  const [width, setWidth] = useState(0);
  const activeName = state.routes[state.index]?.name;
  const walking = walkStatus !== 'idle';

  const renderTab = (name: string) => {
    const route = state.routes.find((r) => r.name === name);
    if (!route) return null;
    const { label, icon: Icon } = META[name];
    const active = activeName === name;

    return (
      <Slot
        key={name}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        accessibilityLabel={label}
        onPress={() => {
          const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!active && !event.defaultPrevented) {
            select();
            navigateToTab(route.key);
          }
        }}
      >
        <IconLift animate={{ translateY: active ? -RFValue(4) : RFValue(6) }} transition={spring(theme.motion.spring)}>
          <Icon size={RFValue(23)} color={active ? theme.colors.primary : theme.colors.onInkMuted} strokeWidth={active ? 2.6 : 2} />
          <TabLabel animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.6 }} transition={spring(theme.motion.spring)}>
            <TabLabelText>{label}</TabLabelText>
          </TabLabel>
          <Dot animate={{ scale: active ? 1 : 0, opacity: active ? 1 : 0 }} transition={spring(theme.motion.springBouncy)} />
        </IconLift>
      </Slot>
    );
  };

  return (
    <Wrapper $bottom={insets.bottom} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <BarBackground width={width} height={BAR_HEIGHT + insets.bottom} cradleRadius={CRADLE_RADIUS} cornerRadius={theme.radii.large} color={theme.colors.ink} />
      ) : null}
      <Row>
        <Side>{LEFT.map(renderTab)}</Side>
        <Gap />
        <Side>{RIGHT.map(renderTab)}</Side>
      </Row>

      <FabWrap>
        {walking ? (
          <Timer from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={spring({ damping: 14 })}>
            <TimerText>{duration(elapsedSeconds)}</TimerText>
          </Timer>
        ) : null}
        <PressableScale
          scaleTo={0.88}
          haptic="none"
          onPress={() => {
            thump();
            router.push('/walk');
          }}
          accessibilityLabel={walking ? 'Voltar ao passeio em andamento' : 'Começar passeio'}
        >
          <TennisBall size={FAB_SIZE} spinning={walking}>
            <Footprints size={RFValue(24)} color={theme.colors.ink} strokeWidth={2.6} />
          </TennisBall>
        </PressableScale>
      </FabWrap>
    </Wrapper>
  );
}
