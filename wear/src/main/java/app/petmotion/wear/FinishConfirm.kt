package app.petmotion.wear

/**
 * Finalizar no pulso precisa de dois toques (o primeiro "arma", o segundo confirma dentro da janela).
 * Evita encerrar o passeio com um esbarrão na tela.
 */
class FinishConfirm(private val windowMs: Long = 3_000) {
  private var armedAt: Long? = null

  fun isArmed(now: Long): Boolean = armedAt?.let { now - it <= windowMs } ?: false

  /** true = confirmou (segundo toque a tempo); false = só armou. */
  fun tap(now: Long): Boolean {
    if (isArmed(now)) {
      armedAt = null
      return true
    }
    armedAt = now
    return false
  }
}
