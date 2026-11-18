import { Fallback, Initial, Photo, Ring } from './styles';
import type { PetAvatarProps } from './types';

export function PetAvatar({ pet, size, ring = false }: PetAvatarProps) {
  return (
    <Ring $size={size} $ring={ring} accessibilityLabel={`Foto de ${pet.name}`}>
      {pet.photo_url ? (
        <Photo source={{ uri: pet.photo_url }} contentFit="cover" transition={250} />
      ) : (
        <Fallback $species={pet.species}>
          <Initial $size={size}>{pet.name.charAt(0).toUpperCase()}</Initial>
        </Fallback>
      )}
    </Ring>
  );
}
