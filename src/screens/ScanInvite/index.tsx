import { useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { Camera as CameraIcon } from 'lucide-react-native';
import { useRef } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useModalTopInset } from '@/hooks/useModalTopInset';
import { useSafeInsets } from '@/hooks/useSafeInsets';
import { parseInviteCode } from '@/utils/invite';
import { customToast } from '@/utils/toast';
import { Body, Camera, Frame, Hint, Screen } from './styles';
import type { ScannedBarcode } from './types';

export function ScanInviteScreen() {
  const insets = useSafeInsets();
  const modalTop = useModalTopInset();
  const [permission, requestPermission] = useCameraPermissions();
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

  return (
    <Screen $top={modalTop} $bottom={insets.bottom}>
      <ScreenHeader title="Recebi um convite" subtitle="Aponte para o QR de quem convidou você." onBack={() => router.back()} />
      {permission?.granted ? (
        <Body $bottom={insets.bottom}>
          <Frame>
            <Camera facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={onScanned} />
          </Frame>
          <Hint>Se o convite veio por link, é só tocar nele.</Hint>
        </Body>
      ) : null}
      {permission && !permission.granted ? (
        <Body $bottom={insets.bottom}>
          <EmptyState
            icon={CameraIcon}
            title="Precisamos da câmera"
            message="Ela serve só para ler o QR do convite."
            actionLabel="Permitir câmera"
            onAction={requestPermission}
          />
        </Body>
      ) : null}
    </Screen>
  );
}
