/* eslint-disable @typescript-eslint/no-require-imports */
/** Moti vira View/Text comuns; as props de animação ficam disponíveis para inspeção. */
const React = require('react');
const { View, Text } = require('react-native');

const strip = ({ from, animate, exit, transition, ...rest }: any) => ({
  ...rest,
  // expõe o estado final da animação para os testes
  testOnly_animate: animate,
});

const MotiView = React.forwardRef((props: any, ref: any) => <View ref={ref} {...strip(props)} />);
const MotiText = React.forwardRef((props: any, ref: any) => <Text ref={ref} {...strip(props)} />);
const AnimatePresence = ({ children }: any) => <>{children}</>;

module.exports = { __esModule: true, MotiView, MotiText, AnimatePresence };
