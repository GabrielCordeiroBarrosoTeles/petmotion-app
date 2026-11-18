import { AnimatePresence } from 'moti';
import { useEffect, useState } from 'react';
import { spring } from '@/theme/motion';
import { thump } from '@/utils/haptics';
import { Digit, Overlay } from './styles';
import type { CountdownProps } from './types';

const SEQUENCE = ['3', '2', '1', 'Vai!'];

export function Countdown({ active, onDone }: CountdownProps) {
  const [step, setStep] = useState(-1);

  useEffect(() => {
    if (!active) {
      setStep(-1);
      return;
    }
    setStep(0);
  }, [active]);

  useEffect(() => {
    if (step < 0) return;
    thump();
    const id = setTimeout(() => {
      if (step >= SEQUENCE.length - 1) onDone();
      else setStep(step + 1);
    }, step === SEQUENCE.length - 1 ? 450 : 750);
    return () => clearTimeout(id);
  }, [step, onDone]);

  if (step < 0) return null;

  return (
    <Overlay pointerEvents="none" accessibilityLiveRegion="assertive">
      <AnimatePresence exitBeforeEnter>
        <Digit
          key={SEQUENCE[step]}
          from={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.8 }}
          transition={spring({ damping: 10, stiffness: 220 })}
        >
          {SEQUENCE[step]}
        </Digit>
      </AnimatePresence>
    </Overlay>
  );
}
