package com.vlocker

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.facebook.react.ReactInstanceManager
import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.core.DeviceEventManagerModule

class ScreenReceiver(private val application: com.facebook.react.ReactApplication) : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_SCREEN_OFF) {
            sendEvent("SCREEN_OFF", null)
        } else if (intent.action == Intent.ACTION_SCREEN_ON) {
            sendEvent("SCREEN_ON", null)
        }
    }

    private fun sendEvent(eventName: String, params: Any?) {
        try {
            val reactInstanceManager = application.reactNativeHost.reactInstanceManager
            val reactContext = reactInstanceManager.currentReactContext
            if (reactContext != null && reactContext.hasActiveCatalystInstance()) {
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit(eventName, params)
            }
        } catch (e: Exception) {
            // Handle potential errors if RN is not ready
        }
    }
}
