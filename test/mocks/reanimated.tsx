/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Mock enxuto do Reanimated 4 (o mock oficial tenta inicializar o módulo nativo no Jest).
 * Animações vão direto ao valor final; callbacks de fim rodam na hora com finished=true;
 * as funções de estilo/props animados são executadas, então o código delas é coberto.
 */
const React = require('react');
const { View, Text } = require('react-native');

const identity = (t: number) => t;
const Easing = {
  linear: identity,
  quad: identity,
  cubic: identity,
  out: (f: (t: number) => number) => f,
  inOut: (f: (t: number) => number) => f,
};

const reduced = { value: false };
/** autoFinish=false simula animação interrompida (callback recebe finished=false). */
const timing = { autoFinish: true };

const mock = {
  __esModule: true,
  Easing,
  useSharedValue: (initial: unknown) => React.useRef({ value: initial }).current,
  useAnimatedStyle: (fn: () => object) => fn(),
  useAnimatedProps: (fn: () => object) => fn(),
  useReducedMotion: () => reduced.value,
  withTiming: (to: unknown, _config?: unknown, cb?: (finished: boolean) => void) => {
    cb?.(timing.autoFinish);
    return timing.autoFinish ? to : 0.5;
  },
  withSpring: (to: unknown) => to,
  withDelay: (_ms: number, value: unknown) => value,
  withRepeat: (value: unknown) => value,
  runOnJS: (fn: (...args: unknown[]) => unknown) => fn,
  createAnimatedComponent: (Component: unknown) => Component,
  __setReducedMotion: (value: boolean) => {
    reduced.value = value;
  },
  __setAutoFinish: (value: boolean) => {
    timing.autoFinish = value;
  },
};

module.exports = { ...mock, default: { View, Text, createAnimatedComponent: mock.createAnimatedComponent } };
