package app.petmotion.wear

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class WalkFormatTest {
  @Test fun `cronometro em minutos e com hora`() {
    assertEquals("00:00", clockLabel(0))
    assertEquals("05:07", clockLabel(307_999))
    assertEquals("1:02:03", clockLabel(3_723_000))
  }

  @Test fun `km com virgula e passos com ponto`() {
    assertEquals("0,83", kmLabel(830))
    assertEquals("12,50", kmLabel(12_500))
    assertEquals("1.680", stepsLabel(1_680))
  }
}

class FinishConfirmTest {
  @Test fun `primeiro toque arma, segundo a tempo confirma`() {
    val c = FinishConfirm(windowMs = 3_000)
    assertFalse(c.isArmed(0))
    assertFalse(c.tap(1_000))
    assertTrue(c.isArmed(2_000))
    assertTrue(c.tap(4_000))
    assertFalse(c.isArmed(4_001)) // confirmou: desarma
  }

  @Test fun `segundo toque atrasado so arma de novo`() {
    val c = FinishConfirm(windowMs = 3_000)
    c.tap(0)
    assertFalse(c.isArmed(3_001))
    assertFalse(c.tap(3_001))
    assertTrue(c.tap(3_500))
  }
}
