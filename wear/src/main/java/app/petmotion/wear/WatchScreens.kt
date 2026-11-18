package app.petmotion.wear

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicText
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay


@Composable
fun WatchApp(state: WatchState, onAction: (WatchAction) -> Unit) {
  Box(Modifier.fillMaxSize().background(Brand.Ink), contentAlignment = Alignment.Center) {
    if (state.walking) LiveScreen(state, onAction) else IdleScreen(state, onAction)
  }
}

@Composable
private fun IdleScreen(state: WatchState, onAction: (WatchAction) -> Unit) {
  val haptics = LocalHapticFeedback.current
  Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
    Ball(size = 40.dp)
    BasicText("PetMotion", style = text(13, Brand.Muted, FontWeight.SemiBold))
    if (state.pet == null) {
      BasicText(
        "Abra o PetMotion\nno celular",
        style = text(15, Brand.OnInk, FontWeight.Bold, TextAlign.Center),
      )
    } else {
      BasicText("Bora passear\ncom o ${state.pet}?", style = text(16, Brand.OnInk, FontWeight.ExtraBold, TextAlign.Center))
      Pill("Passear", Brand.Ball, Brand.Ink) {
        haptics.performHapticFeedback(HapticFeedbackType.LongPress)
        onAction(WatchAction.Start)
      }
    }
  }
}

@Composable
private fun LiveScreen(state: WatchState, onAction: (WatchAction) -> Unit) {
  val haptics = LocalHapticFeedback.current
  var now by remember { mutableLongStateOf(System.currentTimeMillis()) }
  LaunchedEffect(state.status) {
    while (state.status == WalkStatus.Running) {
      now = System.currentTimeMillis()
      delay(250)
    }
  }
  val confirm = remember { FinishConfirm() }
  var armed by remember { mutableStateOf(false) }
  LaunchedEffect(armed) {
    if (armed) {
      delay(3_000)
      armed = false
    }
  }
  val tap: (WatchAction) -> Unit = {
    haptics.performHapticFeedback(HapticFeedbackType.LongPress)
    onAction(it)
  }
  val paused = state.status == WalkStatus.Paused

  Column(horizontalAlignment = Alignment.CenterHorizontally) {
    BasicText(clockLabel(state.elapsedAt(now)), style = text(36, if (paused) Brand.Muted else Brand.OnInk, FontWeight.ExtraBold))
    BasicText(
      if (paused) "Pausado" else "${kmLabel(state.distance)} km · ${stepsLabel(state.steps)} passos",
      style = text(12, Brand.Ball, FontWeight.Bold),
    )
    Spacer(Modifier.height(8.dp))
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
      Mark("Xixi", state.counts.pee, Brand.Sun) { tap(WatchAction.Pee) }
      Mark("Cocô", state.counts.poop, Brand.Earth) { tap(WatchAction.Poop) }
      Mark("Água", state.counts.water, Brand.Sky) { tap(WatchAction.Water) }
    }
    Spacer(Modifier.height(8.dp))
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
      Pill(if (paused) "Seguir" else "Pausar", Brand.Ball, Brand.Ink, width = 64.dp) {
        tap(if (paused) WatchAction.Resume else WatchAction.Pause)
      }
      Pill(if (armed) "Toque de novo" else "Finalizar", if (armed) Brand.Blush else Brand.InkSoft, if (armed) Brand.Ink else Brand.OnInk, width = 84.dp, border = Brand.Blush) {
        haptics.performHapticFeedback(HapticFeedbackType.LongPress)
        if (confirm.tap(System.currentTimeMillis())) {
          armed = false
          onAction(WatchAction.Finish)
        } else {
          armed = true
        }
      }
    }
  }
}

@Composable
private fun Mark(label: String, count: Int, color: Color, onClick: () -> Unit) {
  Column(horizontalAlignment = Alignment.CenterHorizontally) {
    Box(
      Modifier.size(42.dp).background(color, CircleShape).clickable(onClick = onClick),
      contentAlignment = Alignment.Center,
    ) {
      BasicText(if (count > 0) "$count" else "+", style = text(15, Brand.Ink, FontWeight.ExtraBold))
    }
    BasicText(label, style = text(10, Brand.Muted, FontWeight.Bold))
  }
}

@Composable
private fun Pill(
  label: String,
  fill: Color,
  content: Color,
  width: Dp = 104.dp,
  border: Color? = null,
  onClick: () -> Unit,
) {
  val shape = RoundedCornerShape(50)
  val base = Modifier.width(width).height(36.dp).background(fill, shape)
  Box(
    (if (border != null) base.border(1.5.dp, border, shape) else base).clickable(onClick = onClick).padding(horizontal = 6.dp),
    contentAlignment = Alignment.Center,
  ) {
    BasicText(label, style = text(13, content, FontWeight.ExtraBold, TextAlign.Center))
  }
}

/** A bola de tênis da marca (círculo bola com as duas costuras). */
@Composable
private fun Ball(size: Dp) {
  Box(Modifier.size(size).background(Brand.Ball, CircleShape)) {
    Box(Modifier.size(size).padding(horizontal = size * 0.18f).border(2.dp, Color.White.copy(alpha = 0.85f), CircleShape))
  }
}

private fun text(size: Int, color: Color, weight: FontWeight, align: TextAlign = TextAlign.Start) =
  TextStyle(color = color, fontSize = size.sp, fontWeight = weight, textAlign = align)
