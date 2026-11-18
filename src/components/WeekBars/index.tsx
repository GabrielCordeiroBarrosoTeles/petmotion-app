import { RFValue } from 'react-native-responsive-fontsize';
import { weekdayShort } from '@/utils/format';
import { Bar, CHART_HEIGHT, Column, Day, GoalLine, Row, Track } from './styles';
import type { WeekBarsProps } from './types';
import { spring } from '@/theme/motion';

export function WeekBars({ days, goal }: WeekBarsProps) {
  const max = Math.max(goal * 1.25, ...days.map((d) => d.minutes), 1);
  const goalBottom = (goal / max) * CHART_HEIGHT;

  return (
    <Row accessibilityLabel={`Minutos de passeio nos últimos 7 dias: ${days.map((d) => d.minutes).join(', ')}`}>
      <GoalLine $bottom={goalBottom} />
      {days.map((day, i) => {
        const today = i === days.length - 1;
        const height = Math.max(RFValue(6), (day.minutes / max) * CHART_HEIGHT);
        return (
          <Column key={day.date}>
            <Track>
              <Bar
                $height={height}
                $hit={day.minutes >= goal}
                $today={today}
                from={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={spring({ damping: 14, delay: 80 * i })}
              />
            </Track>
            <Day $today={today}>{today ? 'hoje' : weekdayShort(day.date)}</Day>
          </Column>
        );
      })}
    </Row>
  );
}
