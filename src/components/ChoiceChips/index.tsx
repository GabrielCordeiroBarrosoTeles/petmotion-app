import { PressableScale } from '../PressableScale';
import { Chip, ChipText, Row } from './styles';
import type { ChoiceChipsProps } from './types';

export function ChoiceChips({ options, onPick, selected }: ChoiceChipsProps) {
  return (
    <Row>
      {options.map((option) => (
        <PressableScale key={option} haptic="select" onPress={() => onPick(option)} accessibilityLabel={option} accessibilityState={{ selected: selected === option }}>
          <Chip $active={selected === option}>
            <ChipText>{option}</ChipText>
          </Chip>
        </PressableScale>
      ))}
    </Row>
  );
}
