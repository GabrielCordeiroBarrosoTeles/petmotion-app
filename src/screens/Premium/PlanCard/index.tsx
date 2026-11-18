import { PressableScale } from '@/components/PressableScale';
import { spring } from '@/theme/motion';
import { Card, Note, Period, Price, PriceRow, Radio, RadioDot, Tag, Title, Top } from './styles';
import type { PlanCardProps } from './types';

export function PlanCard({ plan, selected, onSelect }: PlanCardProps) {
  return (
    <PressableScale
      haptic="select"
      scaleTo={0.98}
      onPress={() => onSelect(plan.id)}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${plan.title}, ${plan.price} ${plan.period}. ${plan.note}`}
    >
      <Card $selected={selected} animate={{ scale: selected ? 1 : 0.97 }} transition={spring({ damping: 14 })}>
        <Top>
          <Title>{plan.title}</Title>
          <Radio $selected={selected}>{selected ? <RadioDot /> : null}</Radio>
        </Top>
        <PriceRow>
          <Price>{plan.price}</Price>
          <Period>{plan.period}</Period>
        </PriceRow>
        <Note>{plan.note}</Note>
        {plan.tag ? <Tag>{plan.tag}</Tag> : null}
      </Card>
    </PressableScale>
  );
}
