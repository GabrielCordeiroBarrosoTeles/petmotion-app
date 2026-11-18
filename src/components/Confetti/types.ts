export interface ConfettiProps {
  /** Mude a chave para disparar uma nova explosão. */
  burstKey: number;
  count?: number;
}

export interface PieceProps {
  index: number;
  color: string;
  width: number;
}
