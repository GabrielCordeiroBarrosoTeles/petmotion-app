export interface SplashIntroProps {
  /** Fontes e sessão carregadas: a splash pode sair. */
  ready: boolean;
  /** Chamado quando a saída termina (a splash pode ser desmontada). */
  onFinish: () => void;
}

export interface Point {
  x: number;
  y: number;
}
