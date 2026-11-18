import Svg, { Path } from 'react-native-svg';
import { Layer } from './styles';
import type { NotchedBackgroundProps } from './types';

/** Monta o caminho da barra: retângulo arredondado com um encaixe côncavo no meio da borda de cima. */
export function notchedPath(width: number, height: number, notch: number, r: number): string {
  const cx = width / 2;
  const soft = notch * 0.35; // suaviza a entrada e a saída do encaixe
  return [
    `M${r},0`,
    `L${cx - notch - soft},0`,
    `C${cx - notch},0 ${cx - notch},${notch * 0.15} ${cx - notch * 0.92},${notch * 0.38}`,
    `A${notch},${notch} 0 0 0 ${cx + notch * 0.92},${notch * 0.38}`,
    `C${cx + notch},${notch * 0.15} ${cx + notch},0 ${cx + notch + soft},0`,
    `L${width - r},0`,
    `Q${width},0 ${width},${r}`,
    `L${width},${height - r}`,
    `Q${width},${height} ${width - r},${height}`,
    `L${r},${height}`,
    `Q0,${height} 0,${height - r}`,
    `L0,${r}`,
    `Q0,0 ${r},0`,
    'Z',
  ].join(' ');
}

export function NotchedBackground({ width, height, notchRadius, cornerRadius, color }: NotchedBackgroundProps) {
  return (
    <Layer pointerEvents="none">
      <Svg width={width} height={height}>
        <Path d={notchedPath(width, height, notchRadius, cornerRadius)} fill={color} />
      </Svg>
    </Layer>
  );
}
