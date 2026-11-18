import { useMemo } from 'react';
import { RFValue } from 'react-native-responsive-fontsize';
import { PetAvatar } from '@/components/PetAvatar';
import { PressableScale } from '@/components/PressableScale';
import { tap } from '@/utils/haptics';
import { GroupTitle, Item, Name, Row, Title, Wrap } from './styles';
import type { CrewGroup, CrewPickerProps } from './types';

/** "Quem vai junto?": os pets do usuário e os de cada pai/mãe de pet que o convidou. */
export function CrewPicker({ pets, checkedIds, onToggle }: CrewPickerProps) {
  const groups = useMemo(() => {
    const result: CrewGroup[] = [];
    const own = pets.filter((p) => p.role === 'owner');
    if (own.length) result.push({ key: 'own', title: 'Seus pets', pets: own });
    pets
      .filter((p) => p.role === 'walker')
      .forEach((p) => {
        const owner = p.owner_name ?? '';
        const existing = result.find((g) => g.key === `owner:${owner}`);
        if (existing) existing.pets.push(p);
        else result.push({ key: `owner:${owner}`, title: owner ? `Pets de ${owner}` : 'Pets compartilhados', pets: [p] });
      });
    return result;
  }, [pets]);

  const toggle = (id: number) => {
    // mínimo de 1 pet: o último marcado não desmarca
    if (checkedIds.length === 1 && checkedIds[0] === id) {
      tap();
      return;
    }
    onToggle(id);
  };

  return (
    <Wrap>
      <Title>Quem vai junto?</Title>
      {groups.map((g) => (
        <Wrap key={g.key}>
          <GroupTitle>{g.title}</GroupTitle>
          <Row>
            {g.pets.map((p) => {
              const checked = checkedIds.includes(p.id);
              return (
                <PressableScale
                  key={p.id}
                  haptic="select"
                  onPress={() => toggle(p.id)}
                  accessibilityLabel={p.name}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked }}
                >
                  <Item $checked={checked}>
                    <PetAvatar pet={p} size={RFValue(52)} ring={checked} />
                    <Name $checked={checked} numberOfLines={1}>{p.name}</Name>
                  </Item>
                </PressableScale>
              );
            })}
          </Row>
        </Wrap>
      ))}
    </Wrap>
  );
}
