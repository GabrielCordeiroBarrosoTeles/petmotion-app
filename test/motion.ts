/** Controles do mock do Reanimated para os testes. */
const reanimated = jest.requireMock('react-native-reanimated') as {
  __setReducedMotion: (v: boolean) => void;
  __setAutoFinish: (v: boolean) => void;
};

export const setReducedMotion = reanimated.__setReducedMotion;
export const setAutoFinish = reanimated.__setAutoFinish;
