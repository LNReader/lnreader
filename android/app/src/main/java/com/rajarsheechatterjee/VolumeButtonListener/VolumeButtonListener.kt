package com.rajarsheechatterjee.VolumeButtonListener

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class VolumeButtonListener(appContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(appContext) {
    init {
        VolumeButtonListener.appContext = appContext
    }

    @ReactMethod
    fun connect() {
        isActive = true
    }

    @ReactMethod
    fun disconnect() {
        isActive = false
    }

    @ReactMethod
    fun pause() {
        isActive = false
    }

    @ReactMethod
    fun unpause() {
        isActive = true
    }

    @ReactMethod
    fun preventDefault() {
        prevent = true
    }

    @ReactMethod
    fun noPreventDefault() {
        prevent = false
    }

    override fun getName(): String {
        return "VolumeButtonListener"
    }

    @ReactMethod
    fun addListener(eventName: String?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    fun removeListeners(count: Int?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    companion object {
        lateinit var appContext: ReactApplicationContext
        var isActive = false
            private set
        var prevent = false
        fun sendEvent(up: Boolean) {
            if (isActive) {
                val args = Arguments.createMap()
                if (up) appContext.getJSModule(
                    DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
                ).emit(
                    "VolumeUp",
                    args
                ) else appContext.getJSModule(
                    DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
                ).emit("VolumeDown", args)
            }
        }

        fun down() {
            sendEvent(false)
        }

        fun up() {
            sendEvent(true)
        }
    }
}
