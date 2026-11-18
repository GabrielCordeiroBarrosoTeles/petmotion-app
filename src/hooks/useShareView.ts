import * as Sharing from 'expo-sharing';
import { type ComponentRef, useRef, useState } from 'react';
import type { View } from 'react-native';

type CaptureTarget = Parameters<typeof captureRef>[0];
import { captureRef } from 'react-native-view-shot';
import { customToast } from '@/utils/toast';

/** Transforma uma View em PNG e abre a folha de compartilhamento nativa. */
export function useShareView() {
  const ref = useRef<ComponentRef<typeof View>>(null);
  const [sharing, setSharing] = useState(false);

  const share = async (dialogTitle: string) => {
    if (!ref.current) return;
    setSharing(true);
    try {
      const uri = await captureRef(ref.current as unknown as CaptureTarget, { format: 'png', quality: 1, result: 'tmpfile' });
      if (!(await Sharing.isAvailableAsync())) {
        customToast('Compartilhamento indisponível neste aparelho.', 'warning');
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle, UTI: 'public.png' });
    } catch {
      customToast('Não foi possível gerar a imagem do passeio.', 'danger');
    } finally {
      setSharing(false);
    }
  };

  return { ref, share, sharing };
}
