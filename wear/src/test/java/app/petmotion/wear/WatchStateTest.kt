package app.petmotion.wear

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class WatchStateTest {
  private val running = """
    {"status":"running","pet":"Thor","elapsedMs":60000,"at":1000,"distance":812,"steps":900,
     "counts":{"pee":2,"poop":0,"water":1}}
  """.trimIndent()

  @Test fun `le o estado que o celular publica`() {
    val s = WatchState.parse(running)!!
    assertEquals(WatchState(WalkStatus.Running, "Thor", 60_000, 1_000, 812, 900, Counts(2, 0, 1)), s)
    assertTrue(s.walking)
  }

  @Test fun `pausado, parado e sem pet`() {
    assertEquals(WalkStatus.Paused, WatchState.parse("""{"status":"paused","pet":null}""")!!.status)
    val idle = WatchState.parse("""{"status":"idle","pet":null}""")!!
    assertEquals(WalkStatus.Idle, idle.status)
    assertNull(idle.pet)
    assertFalse(idle.walking)
    assertEquals(Counts(), idle.counts) // sem "counts": tudo zero
  }

  @Test fun `contagem parcial vira zero no que faltar`() {
    assertEquals(Counts(pee = 1), WatchState.parse("""{"status":"running","pet":"Mel","counts":{"pee":1}}""")!!.counts)
  }

  @Test fun `mensagem estranha e ignorada`() {
    assertNull(WatchState.parse("isso não é json"))
    assertNull(WatchState.parse("""{"pet":"Thor"}""")) // sem status
  }

  @Test fun `rodando, o cronometro anda sozinho e pausado fica parado`() {
    val s = WatchState(status = WalkStatus.Running, elapsedMs = 60_000, at = 1_000)
    assertEquals(65_000, s.elapsedAt(6_000))
    assertEquals(60_000, s.elapsedAt(500)) // relógio atrasado em relação ao celular: não volta no tempo
    assertEquals(60_000, s.copy(status = WalkStatus.Paused).elapsedAt(9_000))
  }

  @Test fun `acoes usam os nomes que o app RN entende`() {
    assertEquals(
      listOf("pee", "poop", "water", "pause", "resume", "start", "finish"),
      WatchAction.entries.map { it.wire },
    )
  }
}
