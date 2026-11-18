import {
  BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { useFonts } from 'expo-font';
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from 'styled-components/native';
import { ConfirmHost } from '@/components/ConfirmSheet';
import { SplashIntro } from '@/components/SplashIntro';
import { ToastHost } from '@/components/ToastHost';
import { useWearSync } from '@/hooks/useWearSync';
import { useAuth } from '@/store/auth';
import { usePets } from '@/store/pets';
import { theme } from '@/theme';
import { GestureRoot, RootView, stackOptions } from './styles';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function useAuthGate() {
  const status = useAuth((s) => s.status);
  const segments = useSegments();

  useEffect(() => {
    if (status === 'booting') return;
    const inAuth = segments[0] === '(auth)';
    if (status === 'signedOut' && !inAuth) router.replace('/login');
    if (status === 'signedIn' && inAuth) router.replace('/home');
    if (status === 'signedOut') usePets.getState().reset();
  }, [status, segments]);
}

export function RootLayout() {
  const [fontsLoaded] = useFonts({
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  const status = useAuth((s) => s.status);
  const bootstrap = useAuth((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const ready = fontsLoaded && status !== 'booting';
  const [introOver, setIntroOver] = useState(false);
  const finishIntro = useCallback(() => setIntroOver(true), []);

  // a splash nativa sai assim que as fontes chegam: daí em diante a abertura animada assume
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => undefined);
  }, [fontsLoaded]);

  useAuthGate();
  useWearSync();

  if (!fontsLoaded) return null;

  return (
    <GestureRoot>
      <SafeAreaProvider>
        <ThemeProvider theme={theme}>
          <RootView>
            <StatusBar style="dark" />
            {ready ? (
              <>
                <Stack screenOptions={stackOptions}>
                  <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
                  <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
                  <Stack.Screen name="walk" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom', gestureEnabled: false }} />
                  <Stack.Screen name="walk-summary" options={{ presentation: 'fullScreenModal', animation: 'fade', gestureEnabled: false }} />
                  <Stack.Screen name="pet-form" options={{ presentation: 'modal' }} />
                  <Stack.Screen name="health-form" options={{ presentation: 'modal' }} />
                  <Stack.Screen name="delete-account" options={{ presentation: 'modal' }} />
                  <Stack.Screen name="premium" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="walk-photo" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="convite/[code]" options={{ presentation: 'modal' }} />
                  <Stack.Screen name="scan-invite" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
                </Stack>
                <ToastHost />
                <ConfirmHost />
              </>
            ) : null}
            {introOver ? null : <SplashIntro ready={ready} onFinish={finishIntro} />}
          </RootView>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureRoot>
  );
}
