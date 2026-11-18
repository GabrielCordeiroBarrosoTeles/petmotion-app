import { memo } from 'react';
import { Pressable } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components/native';
import { spring } from '@/theme/motion';
import { dayMonthLabel, fullDateLabel } from '@/utils/format';
import { HEALTH_META } from '@/utils/health';
import { Content, Dot, Line, Meta, Notes, Rail, Row, Title } from './styles';
import type { TimelineItemProps } from './types';

function TimelineItemBase({ record, index, isLast, onLongPress }: TimelineItemProps) {
  const theme = useTheme();
  const meta = HEALTH_META[record.type];
  const Icon = meta.icon;

  return (
    <Pressable
      onLongPress={() => onLongPress(record)}
      delayLongPress={400}
      accessibilityLabel={`${meta.label}: ${record.title}, em ${fullDateLabel(record.date)}`}
      accessibilityHint="Toque e segure para excluir"
    >
      <Row from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={spring({ damping: 16, delay: Math.min(index, 8) * 60 })}>
        <Rail>
          <Dot $type={record.type}>
            <Icon size={RFValue(18)} color={theme.colors.ink} strokeWidth={2.4} />
          </Dot>
          {isLast ? null : <Line />}
        </Rail>
        <Content>
          <Title>{record.title}</Title>
          <Meta>
            {meta.label} · {fullDateLabel(record.date)}
            {record.next_date ? ` · próxima ${dayMonthLabel(record.next_date)}` : ''}
          </Meta>
          {record.notes ? <Notes>{record.notes}</Notes> : null}
        </Content>
      </Row>
    </Pressable>
  );
}

export const TimelineItem = memo(TimelineItemBase);
