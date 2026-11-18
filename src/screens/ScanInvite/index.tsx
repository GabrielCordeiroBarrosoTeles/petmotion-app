import { useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { Camera as CameraIcon, KeyRound } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextField } from '@/components/TextField';
import { KeyboardScrollContext } from '@/hooks/KeyboardScrollContext';
import { useKeyboardAwareScroll } from '@/hooks/useKeyboardAwareScroll';
import { useModalTopInset } from '@/hooks/useModalTopInset';
import { useSafeInsets } from '@/hooks/useSafeInsets';
import { parseInviteCode } from '@/utils/invite';
import { customToast } from '@/utils/toast';
import { Body, Camera, Frame, Hint, Manual, Screen, Scroll } from './styles';
import type { ScannedBarcode } from './types';

export function ScanInviteScreen() {
  const insets = useSafeInsets();
  const modalTop = useModalTopInset();
  const [permission, requestPermission] = useCameraPermissions();
  const { scrollRef, keyboardHeight, onScroll, scrollToFocused } = useKeyboardAwareScroll();
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | null>(null);
  // a câmera lê o mesmo QR dezenas de vezes por segundo: só reage quando o conteúdo muda
  const last = useRef<string | null>(null);

  const onScanned = ({ data }: ScannedBarcode) => {
    if (data === last.current) return;
    last.current = data;
    const code = parseInviteCode(data);
    if (!code) {
      customToast('Esse QR não é de um convite do PetMotion.', 'warning');
      return;
    }
    router.replace(`/convite/${code}`);
  };

  // aceita o código puro ou o link inteiro colado
  const openTyped = () => {
    if (!typed.trim()) {
      setError('Digite o código do convite.');
      return;
    }
    const code = parseInviteCode(typed);
    if (!code) {
      setError('Esse código não parece certo. Confira as 8 letras e números.');
      return;
    }
    router.replace(`/convite/${code}`);
  };

  return (
    <Screen $top={modalTop}>
      <ScreenHeader
        title="Recebi um convite"
        subtitle="Aponte para o QR ou digite o código de quem convidou você."
        onBack={() => router.back()}
      />
      <KeyboardScrollContext.Provider value={scrollToFocused}>
        <Scroll ref={scrollRef} onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: keyboardHeight }}>
          <Body $bottom={insets.bottom}>
            {permission?.granted ? (
              <>
                <Frame>
                  <Camera facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={onScanned} />
                </Frame>
                <Hint>Se o convite veio por link, é só tocar nele.</Hint>
              </>
            ) : null}
            {permission && !permission.granted ? (
              <EmptyState
                icon={CameraIcon}
                title="Precisamos da câmera"
                message="Ela serve só para ler o QR do convite. Se preferir, digite o código abaixo."
                actionLabel="Permitir câmera"
                onAction={requestPermission}
              />
            ) : null}
            <Manual>
              <TextField
                label="Ou digite o código"
                icon={KeyRound}
                value={typed}
                onChangeText={(t) => {
                  setTyped(t);
                  setError(null);
                }}
                error={error}
                placeholder="8 letras e números"
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="go"
                onSubmitEditing={openTyped}
              />
              <Button title="Abrir convite" variant="ink" onPress={openTyped} />
            </Manual>
          </Body>
        </Scroll>
      </KeyboardScrollContext.Provider>
    </Screen>
  );
}
