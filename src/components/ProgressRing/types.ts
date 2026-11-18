export interface ProgressRingProps {
  /** 0..1 */
  progress: number;
  size: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
}
