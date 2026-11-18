import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components/native';
import { spring } from '@/theme/motion';
import { daysUntil, relativeDay } from '@/utils/format';
import { HEALTH_META } from '@/utils/health';
import { Card, Days, DaysLabel, Title, TypeRow, TypeText, type DueTone } from './styles';
import type { DueCardProps } from './types';

export function DueCard({ record, index }: DueCardProps) {
  const theme = useTheme();
  const days = daysUntil(record.next_date!);
  const tone: DueTone = days < 0 ? 'late' : days <= 7 ? 'soon' : 'later';
  const meta = HEALTH_META[record.type];
  const Icon = meta.icon;
  const label = days < 0 ? (days === -1 ? 'dia atrasado' : 'dias atrasado') : days === 0 ? 'é hoje' : days === 1 ? 'dia' : 'dias';

  return (
    <Card
      $tone={tone}
      from={{ opacity: 0, translateX: 30 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={spring({ damping: 15, delay: index * 70 })}
      accessibilityLabel={`${meta.label} ${record.title}, ${days < 0 ? `atrasado ${-days} dias` : relativeDay(record.next_date!)}`}
    >
      <Days>{days === 0 ? 'Hoje' : Math.abs(days)}</Days>
      {days === 0 ? null : <DaysLabel>{label}</DaysLabel>}
      <Title numberOfLines={2}>{record.title}</Title>
      <TypeRow>
        <Icon size={RFValue(12)} color={theme.colors.inkSoft} strokeWidth={2.6} />
        <TypeText>{meta.label}</TypeText>
      </TypeRow>
    </Card>
  );
}
