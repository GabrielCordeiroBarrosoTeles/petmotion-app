import { Pencil } from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components/native';
import { PetAvatar } from '@/components/PetAvatar';
import { PressableScale } from '@/components/PressableScale';
import { spring } from '@/theme/motion';
import { petAge } from '@/utils/format';
import { Edit, Meta, Name, Row, Texts } from './styles';
import type { PetRowProps } from './types';

export function PetRow({ pet, index, onPress }: PetRowProps) {
  const theme = useTheme();
  const walker = pet.role === 'walker';
  const details = [pet.breed, petAge(pet.birth_date), pet.weight_kg ? `${String(pet.weight_kg).replace('.', ',')} kg` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <PressableScale onPress={() => onPress(pet)} scaleTo={0.98} disabled={walker} accessibilityLabel={walker ? pet.name : `Editar ${pet.name}`}>
      <Row from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={spring({ damping: 16, delay: index * 60 })}>
        <PetAvatar pet={pet} size={RFValue(56)} />
        <Texts>
          <Name>{pet.name}</Name>
          <Meta numberOfLines={1}>{walker ? `Pet de ${pet.owner_name}` : details || (pet.species === 'dog' ? 'Cachorro' : 'Gato')}</Meta>
        </Texts>
        {walker ? null : (
          <Edit>
            <Pencil size={RFValue(18)} color={theme.colors.ink} />
          </Edit>
        )}
      </Row>
    </PressableScale>
  );
}
