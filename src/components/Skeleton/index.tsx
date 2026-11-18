import { Block } from './styles';
import type { SkeletonProps } from './types';
import { timing } from '@/theme/motion';

export function Skeleton({ width = '100%', height, radius = 12, delay = 0 }: SkeletonProps) {
  return (
    <Block
      $width={width}
      $height={height}
      $radius={radius}
      from={{ opacity: 0.45 }}
      animate={{ opacity: 1 }}
      transition={timing({ duration: 750, loop: true, repeatReverse: true, delay })}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
