/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Mocks globais dos módulos nativos. Cada teste pode sobrescrever o comportamento
 * com `jest.mocked(Modulo.funcao).mockResolvedValueOnce(...)`.
 */
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => require('./mocks/reanimated'));
jest.mock('moti', () => require('./mocks/moti'));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

// Ícones: um componente simples com o nome do ícone (testes ficam rápidos e legíveis)
jest.mock('lucide-react-native', () => {
  const { Text } = require('react-native');
  return new Proxy(
    {},
    {
      get: (_target, name: string) => {
        if (name === '__esModule') return true;
        const Icon = () => <Text>{`icon:${name}`}</Text>;
        Icon.displayName = name;
        return Icon;
      },
    },
  );
});

// MapLibre: cada peça vira uma View com as props que os testes conferem
jest.mock('@maplibre/maplibre-react-native', () => {
  const { View } = require('react-native');
  const Map = (p: any) => (
    <View testID="map" accessibilityLabel={p.accessibilityLabel} dragPan={p.dragPan} touchZoom={p.touchZoom} attribution={p.attribution}>
      {p.children}
    </View>
  );
  const Camera = (p: any) => <View testID="camera" initialViewState={p.initialViewState} center={p.center} zoom={p.zoom} />;
  const GeoJSONSource = (p: any) => <View testID="route-source" data={p.data}>{p.children}</View>;
  const Layer = (p: any) => <View testID="layer" paint={p.paint} />;
  const Marker = (p: any) => <View testID="marker" lngLat={p.lngLat}>{p.children}</View>;
  return { Map, Camera, GeoJSONSource, Layer, Marker };
});

jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return { Image: (p: any) => <View testID="image" accessibilityLabel={p.source?.uri} /> };
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  getLastKnownPositionAsync: jest.fn(() => Promise.resolve({ coords: { latitude: -23.5, longitude: -46.6 } })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({ coords: { latitude: -23.5, longitude: -46.6 } })),
  watchPositionAsync: jest.fn(() => Promise.resolve({ remove: jest.fn() })),
  Accuracy: { BestForNavigation: 6, Balanced: 3 },
}));

jest.mock('expo-sensors', () => ({
  Pedometer: {
    isAvailableAsync: jest.fn(() => Promise.resolve(true)),
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
    watchStepCount: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('id')),
  dismissNotificationAsync: jest.fn(() => Promise.resolve()),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  getLastNotificationResponse: jest.fn(() => null),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  AndroidImportance: { LOW: 2, HIGH: 4 },
  SchedulableTriggerInputTypes: { DATE: 'date', DAILY: 'daily' },
}));

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  launchCameraAsync: jest.fn(() => Promise.resolve({ canceled: false, assets: [{ uri: 'file://camera.jpg' }] })),
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ canceled: false, assets: [{ uri: 'file://gallery.jpg' }] })),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn(() => Promise.resolve('file://card.png')) }));

jest.mock('expo-camera', () => {
  const { View } = require('react-native');
  const CameraView = (p: any) => <View testID="camera-view" onBarcodeScanned={p.onBarcodeScanned} barcodeScannerSettings={p.barcodeScannerSettings} />;
  return { CameraView, useCameraPermissions: jest.fn(() => [{ granted: true }, jest.fn()]) };
});

jest.mock('react-native-qrcode-svg', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: (p: any) => <View testID="qr" accessibilityLabel={p.value} /> };
});

jest.mock('expo-font', () => ({ useFonts: jest.fn(() => [true]) }));
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));

// Tabs: renderiza a tab bar customizada com props de navegação falsas
jest.mock('expo-router/tabs', () => {
  const { View, Text } = require('react-native');
  const Tabs = ({ tabBar, children }: { tabBar: (p: unknown) => React.ReactNode; children: React.ReactNode }) => (
    <View testID="tabs">
      {children}
      {tabBar({
        state: { index: 0, routes: ['home', 'history', 'health', 'profile'].map((name) => ({ key: name, name })) },
        emitter: { emit: () => ({ defaultPrevented: false }) },
        navigateToTab: jest.fn(),
        descriptors: {},
        insets: { top: 0, bottom: 0, left: 0, right: 0 },
      })}
    </View>
  );
  Tabs.Screen = ({ name }: { name: string }) => <Text>{`tab:${name}`}</Text>;
  return { Tabs };
});

jest.mock('expo-status-bar', () => ({ StatusBar: () => null, setStatusBarStyle: jest.fn() }));

jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: { hostUri: '192.168.0.10:8081', version: '1.0.0' } } }));

// expo-router: navegação simulada; useFocusEffect roda como um efeito comum
jest.mock('expo-router', () => {
  const React = require('react');
  const router = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), navigate: jest.fn() };
  const focusCallbacks = new Set<() => unknown>();
  global.__router = router;
  global.__focus = () => focusCallbacks.forEach((cb) => cb());
  return {
    router,
    useLocalSearchParams: jest.fn(() => ({})),
    useSegments: jest.fn(() => []),
    // roda ao montar (como a primeira vez que a tela ganha foco); global.__focus() simula voltar à tela
    useFocusEffect: (cb: () => void | (() => void)) =>
      React.useEffect(() => {
        focusCallbacks.add(cb);
        const cleanup = cb();
        return () => {
          focusCallbacks.delete(cb);
          if (typeof cleanup === 'function') cleanup();
        };
      }, [cb]),
    Stack: Object.assign(
      ({ children, screenOptions }: { children?: React.ReactNode; screenOptions?: unknown }) => {
        const { View } = require('react-native');
        return <View testID="stack" accessibilityHint={JSON.stringify(screenOptions ?? null)}>{children}</View>;
      },
      { Screen: ({ name }: { name: string }) => { const { Text } = require('react-native'); return <Text>{`screen:${name}`}</Text>; } },
    ),
    Redirect: ({ href }: { href: string }) => {
      const { Text } = require('react-native');
      return <Text>{`redirect:${href}`}</Text>;
    },
  };
});


declare global {
  // eslint-disable-next-line no-var
  // eslint-disable-next-line no-var
  var __router: { push: jest.Mock; replace: jest.Mock; back: jest.Mock; navigate: jest.Mock };
  // eslint-disable-next-line no-var
  var __focus: () => void;
}
