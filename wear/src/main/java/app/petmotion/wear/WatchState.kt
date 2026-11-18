package app.petmotion.wear

import org.json.JSONObject

enum class WalkStatus { Idle, Running, Paused }

data class Counts(val pee: Int = 0, val poop: Int = 0, val water: Int = 0)

/**
 * Estado do passeio que o celular publica em /petmotion/walk (ver src/services/wear.ts no app RN).
 * O relógio só desenha: o GPS, os passos e o salvamento continuam no celular.
 */
data class WatchState(
  val status: WalkStatus = WalkStatus.Idle,
  val pet: String? = null,
  val elapsedMs: Long = 0,
  val at: Long = 0,
  val distance: Int = 0,
  val steps: Int = 0,
  val counts: Counts = Counts(),
) {
  val walking: Boolean get() = status != WalkStatus.Idle

  /** Rodando, o cronômetro anda sozinho a partir de `at` (sem esperar a próxima mensagem do celular). */
  fun elapsedAt(now: Long): Long =
    if (status == WalkStatus.Running) elapsedMs + maxOf(0L, now - at) else elapsedMs

  companion object {
    /** JSON do celular → estado. Mensagem estranha (outra versão, corrompida) vira null e é ignorada. */
    fun parse(json: String): WatchState? = runCatching {
      val o = JSONObject(json)
      val counts = o.optJSONObject("counts")
      WatchState(
        status = when (o.getString("status")) {
          "running" -> WalkStatus.Running
          "paused" -> WalkStatus.Paused
          else -> WalkStatus.Idle
        },
        pet = if (o.isNull("pet")) null else o.getString("pet"),
        elapsedMs = o.optLong("elapsedMs"),
        at = o.optLong("at"),
        distance = o.optInt("distance"),
        steps = o.optInt("steps"),
        counts = Counts(
          pee = counts?.optInt("pee") ?: 0,
          poop = counts?.optInt("poop") ?: 0,
          water = counts?.optInt("water") ?: 0,
        ),
      )
    }.getOrNull()
  }
}

/** O que o relógio pede ao celular (mensagem em /petmotion/action). */
enum class WatchAction(val wire: String) {
  Pee("pee"), Poop("poop"), Water("water"), Pause("pause"), Resume("resume"), Start("start"), Finish("finish"),
}
