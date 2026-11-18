import { router, useLocalSearchParams } from 'expo-router';
import { Camera, Images, Share2, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components/native';
import { Button } from '@/components/Button';
import { PressableScale } from '@/components/PressableScale';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useFetch } from '@/hooks/useFetch';
import { useSafeInsets } from '@/hooks/useSafeInsets';
import { useShareView } from '@/hooks/useShareView';
import { useStatusBar } from '@/hooks/useStatusBar';
import { api } from '@/services/api';
import { useAuth } from '@/store/auth';
import { spring } from '@/theme/motion';
import { type ImageSource, pickImage } from '@/utils/pickImage';
import { customToast } from '@/utils/toast';
import { PhotoOverlay } from './PhotoOverlay';
import type { OverlayStyle } from './PhotoOverlay/types';
import { WalkPhotoSkeleton } from './SkeletonLoader';
import {
  Body, Canvas, Capture, Close, Empty, EmptyBody, EmptyTitle, Half, Header, Photo, Row, Screen, Scroll, Title,
} from './styles';
import type { WalkPhotoParams } from './types';

const STYLES: { value: OverlayStyle; label: string }[] = [
  { value: 'stats', label: 'Números' },
  { value: 'route', label: 'Trajeto' },
  { value: 'band', label: 'Faixa' },
];

/** Foto do passeio no estilo Strava: a foto do pet com o trajeto e os números por cima. */
export function WalkPhotoScreen() {
  const theme = useTheme();
  const insets = useSafeInsets();
  const { width: screenWidth } = useWindowDimensions();
  useStatusBar('light');
  const { id } = useLocalSearchParams<WalkPhotoParams>();
  const premium = useAuth((s) => !!s.user?.is_premium);
  const { ref, share, sharing } = useShareView();
  const [photo, setPhoto] = useState<string | null>(null);
  const [layout, setLayout] = useState<OverlayStyle>('stats');

  const { data: walk, loading, error } = useFetch(() => api.walk(Number(id)), { deps: [id] });

  useEffect(() => {
    if (error) customToast(error, 'danger');
  }, [error]);

  const width = screenWidth - theme.spacing.large * 2;
  const height = width * 1.25; // 4:5, o formato do feed do Instagram

  const choose = async (source: ImageSource) => {
    const uri = await pickImage(source, [4, 5]);
    if (uri) setPhoto(uri);
  };

  const petName = walk?.pet?.name ?? 'seu pet';

  return (
    <Screen $top={insets.top}>
      <Header>
        <Title accessibilityRole="header">Foto do passeio</Title>
        <PressableScale onPress={() => router.back()} accessibilityLabel="Fechar">
          <Close>
            <X size={RFValue(20)} color={theme.colors.onInk} />
          </Close>
        </PressableScale>
      </Header>

      {loading || !walk ? (
        <WalkPhotoSkeleton width={width} height={height} />
      ) : (
        <Scroll>
          <Body $bottom={insets.bottom}>
            <Canvas $width={width} $height={height} from={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={spring({ damping: 16 })}>
              {photo ? (
                <Capture ref={ref} collapsable={false}>
                  <Photo source={{ uri: photo }} contentFit="cover" transition={250} />
                  <PhotoOverlay walk={walk} petName={petName} layout={layout} width={width} height={height} premium={premium} />
                </Capture>
              ) : (
                <Empty>
                  <Camera size={RFValue(44)} color={theme.colors.primary} strokeWidth={2} />
                  <EmptyTitle>Registre o momento</EmptyTitle>
                  <EmptyBody>Tire uma foto do {petName} ou escolha uma da galeria. O trajeto e os números do passeio entram por cima.</EmptyBody>
                </Empty>
              )}
            </Canvas>

            {photo ? (
              <>
                <SegmentedControl value={layout} onChange={setLayout} options={STYLES} />
                <Button title="Compartilhar foto" icon={Share2} onPress={() => share(`Passeio do ${petName}`)} loading={sharing} />
              </>
            ) : null}

            <Row>
              <Half>
                <Button title={photo ? 'Outra foto' : 'Câmera'} icon={Camera} variant={photo ? 'ink' : 'primary'} compact onPress={() => choose('camera')} />
              </Half>
              <Half>
                <Button title="Galeria" icon={Images} variant="ink" compact onPress={() => choose('library')} />
              </Half>
            </Row>
          </Body>
        </Scroll>
      )}
    </Screen>
  );
}
