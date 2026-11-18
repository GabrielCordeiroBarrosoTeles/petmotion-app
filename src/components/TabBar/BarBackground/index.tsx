import Svg, { Path } from 'react-native-svg';
import { Layer } from './styles';
import type { BarBackgroundProps } from './types';

/**
 * Caminho da barra presa no rodapé: cantos de cima arredondados, base reta e uma elevação
 * no centro que abraça a bola (o "suporte" da bola). A borda de cima fica em y = cradle,
 * para a elevação caber acima dela; a bola fica com o centro em (width/2, cradle).
 */
export function barPath(width: number, height: number, cradle: number, r: number): string {
  const cx = width / 2;
  const top = cradle;
  const soft = cradle * 0.55; // ombro suave entre a barra e a elevação
  const jx = cradle * 0.866; // ponto do círculo a 30° acima do centro
  const jy = top - cradle * 0.5;
  return [
    `M0,${top + r}`,
    `Q0,${top} ${r},${top}`,
    `L${cx - cradle - soft},${top}`,
    `C${cx - cradle},${top} ${cx - cradle},${jy + cradle * 0.18} ${cx - jx},${jy}`,
    `A${cradle},${cradle} 0 0 1 ${cx + jx},${jy}`,
    `C${cx + cradle},${jy + cradle * 0.18} ${cx + cradle},${top} ${cx + cradle + soft},${top}`,
    `L${width - r},${top}`,
    `Q${width},${top} ${width},${top + r}`,
    `L${width},${top + height}`,
    `L0,${top + height}`,
    'Z',
  ].join(' ');
}

export function BarBackground({ width, height, cradleRadius, cornerRadius, color }: BarBackgroundProps) {
  return (
    <Layer $lift={cradleRadius} pointerEvents="none">
      <Svg width={width} height={height + cradleRadius}>
        <Path d={barPath(width, height, cradleRadius, cornerRadius)} fill={color} />
      </Svg>
    </Layer>
  );
}
