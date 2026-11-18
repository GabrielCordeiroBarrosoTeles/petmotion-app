export interface BarBackgroundProps {
  width: number;
  /** Altura da barra (sem contar a elevação da bola). */
  height: number;
  /** Raio da elevação em volta da bola, centrada na borda de cima. */
  cradleRadius: number;
  cornerRadius: number;
  color: string;
}
