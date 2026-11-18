package app.petmotion.wearbridge

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.google.android.gms.wearable.MessageClient
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Ponte celular ↔ relógio (Wear OS Data Layer).
 * - publish(json): grava o estado do passeio em /petmotion/walk (o relógio recebe o mais recente,
 *   mesmo se abrir depois).
 * - Toques do relógio chegam como mensagem em /petmotion/action (pee, poop, water, pause, resume,
 *   start, finish) e viram o evento "WearBridgeAction" no DeviceEventEmitter do JS.
 */
class WearBridgeModule : Module() {
  private val context get() = requireNotNull(appContext.reactContext)

  private val listener = MessageClient.OnMessageReceivedListener { event ->
    if (event.path == ACTION_PATH) {
      val action = String(event.data, Charsets.UTF_8)
      Log.d(TAG, "ação do relógio: $action")
      // DeviceEventEmitter do RN: entrega sempre que o JS estiver ouvindo (src/services/wear.ts)
      (appContext.reactContext as? ReactContext)?.emitDeviceEvent(
        JS_EVENT,
        Arguments.createMap().apply { putString("action", action) },
      )
    }
  }

  override fun definition() = ModuleDefinition {
    Name("WearBridge")

    Function("publish") { json: String ->
      val request = PutDataMapRequest.create(STATE_PATH).apply {
        dataMap.putString("state", json)
        // muda sempre: o Data Layer só avisa o relógio quando o conteúdo é diferente
        dataMap.putLong("sentAt", System.currentTimeMillis())
      }.asPutDataRequest().setUrgent()
      Wearable.getDataClient(context).putDataItem(request)
        .addOnSuccessListener { Log.d(TAG, "estado publicado") }
        .addOnFailureListener { Log.w(TAG, "falha ao publicar", it) }
      Unit
    }

    // ouvinte ligado enquanto o módulo existir (não depende do JS "começar a observar")
    OnCreate {
      Wearable.getMessageClient(context).addListener(listener)
      Log.d(TAG, "ouvindo o relógio")
    }

    OnDestroy {
      Wearable.getMessageClient(context).removeListener(listener)
    }
  }

  companion object {
    const val STATE_PATH = "/petmotion/walk"
    const val ACTION_PATH = "/petmotion/action"
    const val TAG = "WearBridge"
    const val JS_EVENT = "WearBridgeAction"
  }
}
