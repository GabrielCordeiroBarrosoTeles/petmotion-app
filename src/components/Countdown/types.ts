export interface CountdownProps {
  /** Quando true, conta 3-2-1 e chama onDone. */
  active: boolean;
  onDone: () => void;
}
