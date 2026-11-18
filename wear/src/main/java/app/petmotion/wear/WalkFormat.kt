package app.petmotion.wear

import java.text.NumberFormat
import java.util.Locale

private val ptBR = Locale.forLanguageTag("pt-BR")

/** 05:07 ou 1:02:03, como o cronômetro do app. */
fun clockLabel(ms: Long): String {
  val total = ms / 1000
  val h = total / 3600
  val m = (total % 3600) / 60
  val s = total % 60
  return if (h > 0) "%d:%02d:%02d".format(h, m, s) else "%02d:%02d".format(m, s)
}

/** 0,83 (km com vírgula, duas casas). */
fun kmLabel(meters: Int): String = "%.2f".format(ptBR, meters / 1000.0)

/** 1.680 */
fun stepsLabel(steps: Int): String = NumberFormat.getIntegerInstance(ptBR).format(steps)
