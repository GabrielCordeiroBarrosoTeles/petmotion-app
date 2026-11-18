import * as ImagePicker from 'expo-image-picker';
import { customToast } from './toast';

export type ImageSource = 'camera' | 'library';

/**
 * Pede permissão, abre a câmera ou a galeria e devolve a URI da foto (ou null se
 * a pessoa negar ou cancelar). `aspect` é o recorte sugerido no editor do sistema.
 */
export async function pickImage(source: ImageSource, aspect: [number, number]): Promise<string | null> {
  const perm = source === 'camera'
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    customToast(source === 'camera' ? 'Permita o uso da câmera para tirar a foto.' : 'Permita o acesso às fotos.', 'warning');
    return null;
  }
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: true, aspect, quality: 0.8 };
  const result = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  return result.canceled ? null : result.assets[0].uri;
}
