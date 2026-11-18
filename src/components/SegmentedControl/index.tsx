import { useEffect, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from 'styled-components/native';
import { select } from '@/utils/haptics';
import { Container, Indicator, Label, Option, OptionText, Track } from './styles';
import type { SegmentedControlProps } from './types';

export function SegmentedControl<T extends string>({ options, value, onChange, label }: SegmentedControlProps<T>) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const segment = width / options.length;
  const x = useSharedValue(0);

  useEffect(() => {
    x.value = withSpring(index * segment, theme.motion.spring);
  }, [index, segment, theme.motion.spring, x]);

  const indicatorStyle = useAnimatedStyle(() => ({ width: segment, transform: [{ translateX: x.value }] }));

  return (
    <Container>
      {label ? <Label>{label}</Label> : null}
      <Track
        accessibilityRole="radiogroup"
        onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width - RFValue(8))}
      >
        {width > 0 ? <Indicator style={indicatorStyle} /> : null}
        {options.map((option) => {
          const active = option.value === value;
          const Icon = option.icon;
          return (
            <Option
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              accessibilityLabel={option.label}
              onPress={() => {
                if (!active) select();
                onChange(option.value);
              }}
            >
              {Icon ? <Icon size={RFValue(16)} color={active ? theme.colors.primary : theme.colors.textMuted} strokeWidth={2.4} /> : null}
              <OptionText $active={active}>{option.label}</OptionText>
            </Option>
          );
        })}
      </Track>
    </Container>
  );
}
