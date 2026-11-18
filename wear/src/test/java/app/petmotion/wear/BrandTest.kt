package app.petmotion.wear

import androidx.compose.ui.graphics.toArgb
import org.junit.Assert.assertEquals
import org.junit.Test

class BrandTest {
  private fun hex(c: androidx.compose.ui.graphics.Color) = "#%06X".format(c.toArgb() and 0xFFFFFF)

  @Test fun `cores iguais aos tokens do app (pinheiro, bola, neblina e as das marcacoes)`() {
    assertEquals("#0F2A24", hex(Brand.Ink))
    assertEquals("#1C3D35", hex(Brand.InkSoft))
    assertEquals("#C9F24B", hex(Brand.Ball))
    assertEquals("#EEF2EC", hex(Brand.OnInk))
    assertEquals("#A9BDB3", hex(Brand.Muted))
    assertEquals("#FFC24D", hex(Brand.Sun)) // xixi
    assertEquals("#B98B5E", hex(Brand.Earth)) // cocô
    assertEquals("#7FB8E6", hex(Brand.Sky)) // água
    assertEquals("#FF7A8A", hex(Brand.Blush))
  }
}
