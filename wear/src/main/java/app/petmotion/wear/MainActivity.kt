package app.petmotion.wear

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.mutableStateOf
import com.google.android.gms.wearable.DataClient
import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataItem
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.Wearable

/** Liga o Data Layer: lê o estado que o celular publica e manda os toques de volta. */
class MainActivity : ComponentActivity(), DataClient.OnDataChangedListener {
  private val state = mutableStateOf(WatchState())

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContent { WatchApp(state.value, ::send) }
  }

  override fun onResume() {
    super.onResume()
    val data = Wearable.getDataClient(this)
    data.addListener(this)
    // o último estado guardado (o relógio pode ter aberto depois do passeio começar)
    data.dataItems.addOnSuccessListener { items ->
      items.forEach(::apply)
      items.release()
    }
  }

  override fun onPause() {
    Wearable.getDataClient(this).removeListener(this)
    super.onPause()
  }

  override fun onDataChanged(events: DataEventBuffer) {
    events.filter { it.type == DataEvent.TYPE_CHANGED }.forEach { apply(it.dataItem) }
  }

  private fun apply(item: DataItem) {
    if (item.uri.path != STATE_PATH) return
    val json = DataMapItem.fromDataItem(item).dataMap.getString("state") ?: return
    WatchState.parse(json)?.let { state.value = it }
  }

  private fun send(action: WatchAction) {
    Wearable.getNodeClient(this).connectedNodes.addOnSuccessListener { nodes ->
      nodes.forEach { node ->
        Wearable.getMessageClient(this).sendMessage(node.id, ACTION_PATH, action.wire.toByteArray())
      }
    }
  }

  private companion object {
    const val STATE_PATH = "/petmotion/walk"
    const val ACTION_PATH = "/petmotion/action"
  }
}
