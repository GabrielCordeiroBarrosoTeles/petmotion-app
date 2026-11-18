import { router } from 'expo-router';
import { Footprints, HeartPulse, House, Route, UserRound } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSpring, withTiming, Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';
import { useElapsed } from '@/hooks/useElapsed';
import { useWalk } from '@/store/walk';
import { duration } from '@/utils/format';
import { select, thump } from '@/utils/haptics';
import { PressableScale } from '../PressableScale';
import { Bar, Fab, FabPulse, FabSlot, FabTime, Indicator, Slot, TabLabel, Wrapper } from './styles';
import type { TabBarProps, TabMeta } from './types';

const META: Record<string, TabMeta> = {
  home: { label: 'Início', icon: House },
  history: { label: 'Passeios', icon: Route },
  health: { label: 'Saúde', icon: HeartPulse },
  profile: { label: 'Perfil', icon: UserRound },
};

/** Ordem visual: 2 abas | botão Passear | 2 abas */
const SLOTS = ['home', 'history', 'fab', 'health', 'profile'] as const;

export function TabBar({ state, emitter, navigateToTab }: TabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const walkStatus = useWalk((s) => s.status);
  const { elapsedSeconds } = useElapsed();
  const [barWidth, setBarWidth] = useState(0);

  const activeName = state.routes[state.index]?.name;
  const slotIndex = SLOTS.indexOf(activeName as (typeof SLOTS)[number]);
  const slotWidth = (barWidth - RFValue(12)) / SLOTS.length;

  const x = useSharedValue(0);
  useEffect(() => {
    x.value = withSpring(slotIndex * slotWidth, theme.motion.spring);
  }, [slotIndex, slotWidth, theme.motion.spring, x]);
  const indicatorStyle = useAnimatedStyle(() => ({ width: slotWidth, transform: [{ translateX: x.value }] }));

  // "Respiração" do botão central: convida a começar o passeio
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    pulse.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }), -1, false);
  }, [pulse, reduced]);
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.45 }],
  }));

  const walking = walkStatus !== 'idle';

  return (
    <Wrapper $bottom={Math.max(insets.bottom, theme.spacing.small)}>
      <Bar onLayout={(e: LayoutChangeEvent) => setBarWidth(e.nativeEvent.layout.width)}>
        {barWidth > 0 && slotIndex >= 0 ? <Indicator style={indicatorStyle} /> : null}
        {SLOTS.map((name) => {
          if (name === 'fab') {
            return (
              <FabSlot key="fab">
                <FabPulse style={pulseStyle} pointerEvents="none" />
                <PressableScale
                  scaleTo={0.9}
                  haptic="none"
                  onPress={() => {
                    thump();
                    router.push('/walk');
                  }}
                  accessibilityLabel={walking ? 'Voltar ao passeio em andamento' : 'Começar passeio'}
                >
                  <Fab>
                    <Footprints size={RFValue(walking ? 20 : 28)} color={theme.colors.ink} strokeWidth={2.6} />
                    {walking ? <FabTime>{duration(elapsedSeconds)}</FabTime> : null}
                  </Fab>
                </PressableScale>
              </FabSlot>
            );
          }

          const route = state.routes.find((r) => r.name === name);
          if (!route) return null;
          const meta = META[name];
          const active = activeName === name;
          const Icon = meta.icon;

          return (
            <Slot
              key={name}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={meta.label}
              onPress={() => {
                const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!active && !event.defaultPrevented) {
                  select();
                  navigateToTab(route.key);
                }
              }}
            >
              <Icon size={RFValue(22)} color={active ? theme.colors.primary : theme.colors.onInkMuted} strokeWidth={active ? 2.6 : 2} />
              <TabLabel $active={active}>{meta.label}</TabLabel>
            </Slot>
          );
        })}
      </Bar>
    </Wrapper>
  );
}
