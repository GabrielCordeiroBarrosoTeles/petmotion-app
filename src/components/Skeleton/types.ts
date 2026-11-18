export interface SkeletonProps {
  width?: number | `${number}%`;
  height: number;
  radius?: number;
  /** Atraso para o pulso em "onda" entre blocos. */
  delay?: number;
}

export interface SkeletonBlockProps {
  $width: number | string;
  $height: number;
  $radius: number;
}
