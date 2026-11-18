import { Plus } from 'lucide-react-native';
import { MotiView } from 'moti';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components/native';
import { PetAvatar } from '../PetAvatar';
import { PressableScale } from '../PressableScale';
import { AddCircle, Item, Name, Row } from './styles';
import type { PetSwitcherProps } from './types';
import { spring } from '@/theme/motion';

export function PetSwitcher({ pets, selectedId, onSelect, onAdd }: PetSwitcherProps) {
  const theme = useTheme();

  return (
    <Row>
      {pets.map((pet) => {
        const active = pet.id === selectedId;
        return (
          <PressableScale
            key={pet.id}
            haptic="select"
            onPress={() => onSelect(pet.id)}
            accessibilityLabel={`Selecionar ${pet.name}`}
            accessibilityState={{ selected: active }}
          >
            <Item>
              <MotiView animate={{ scale: active ? 1 : 0.86, opacity: active ? 1 : 0.7 }} transition={spring(theme.motion.springBouncy)}>
                <PetAvatar pet={pet} size={RFValue(56)} ring={active} />
              </MotiView>
              <Name $active={active} numberOfLines={1}>{pet.name}</Name>
            </Item>
          </PressableScale>
        );
      })}
      <PressableScale onPress={onAdd} accessibilityLabel="Adicionar pet">
        <Item>
          <AddCircle>
            <Plus size={RFValue(22)} color={theme.colors.onInkMuted} />
          </AddCircle>
          <Name $active={false}>Novo</Name>
        </Item>
      </PressableScale>
    </Row>
  );
}
