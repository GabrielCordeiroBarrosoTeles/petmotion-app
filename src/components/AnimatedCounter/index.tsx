import { useEffect, useRef, useState } from 'react';
import { Value } from './styles';
import type { AnimatedCounterProps } from './types';

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Número que "sobe" até o valor final — dá vida aos KPIs. */
export function AnimatedCounter({ value, format = (n) => String(Math.round(n)), duration = 900, variant = 'stat', onInk, ...text }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const start = Date.now();
    const initial = from.current;
    let frame: number;
    const step = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const next = initial + (value - initial) * easeOut(t);
      setDisplay(next);
      if (t < 1) frame = requestAnimationFrame(step);
      else from.current = value;
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return (
    <Value {...text} $variant={variant} $onInk={onInk} accessibilityLabel={format(value)}>
      {format(display)}
    </Value>
  );
}
