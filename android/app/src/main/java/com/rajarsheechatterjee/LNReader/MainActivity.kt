package com.rajarsheechatterjee.LNReader

import android.os.Bundle
import android.view.KeyEvent
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.rajarsheechatterjee.NativeVolumeButtonListener.NativeVolumeButtonListener
import expo.modules.ReactActivityDelegateWrapper
import org.devio.rn.splashscreen.SplashScreen

class MainActivity : ReactActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        // set transparent statusBar and navigationBar under styles.xml
        super.onCreate(null)
        SplashScreen.show(this, R.style.SplashScreenTheme, R.id.lottie)
        SplashScreen.setAnimationFinished(true)
    }

    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        if (handleSPenKeyEvent(event)) {
            return true
        }
        
        if (NativeVolumeButtonListener.isActive) {
            val action = event.action
            return when (event.keyCode) {
                KeyEvent.KEYCODE_VOLUME_UP -> {
                    if (action == KeyEvent.ACTION_DOWN) {
                        NativeVolumeButtonListener.sendEvent(true)
                    }
                    true
                }

                KeyEvent.KEYCODE_VOLUME_DOWN -> {
                    if (action == KeyEvent.ACTION_DOWN) {
                        NativeVolumeButtonListener.sendEvent(false)
                    }
                    true
                }

                else -> super.dispatchKeyEvent(event)
            }
        }
        return super.dispatchKeyEvent(event)
    }

    private fun handleSPenKeyEvent(event: KeyEvent): Boolean {
        val isUp = event.action == KeyEvent.ACTION_UP
        val ctrlPressed = event.metaState and KeyEvent.META_CTRL_ON > 0

        return when (event.keyCode) {
            KeyEvent.KEYCODE_DPAD_RIGHT -> {
                if (isUp && ctrlPressed) {
                    sendSPenEvent("NEXT_PAGE")
                }
                ctrlPressed // Only consume if ctrl is pressed (S Pen action)
            }
            KeyEvent.KEYCODE_DPAD_LEFT -> {
                if (isUp && ctrlPressed) {
                    sendSPenEvent("PREVIOUS_PAGE")
                }
                ctrlPressed // Only consume if ctrl is pressed (S Pen action)
            }
            KeyEvent.KEYCODE_N -> {
                if (isUp) {
                    sendSPenEvent("NEXT_CHAPTER")
                }
                true
            }
            KeyEvent.KEYCODE_P -> {
                if (isUp) {
                    sendSPenEvent("PREVIOUS_CHAPTER")
                }
                true
            }
            KeyEvent.KEYCODE_M -> {
                if (isUp) {
                    sendSPenEvent("TOGGLE_MENU")
                }
                true
            }
            KeyEvent.KEYCODE_BACK -> {
                if (isUp) {
                    sendSPenEvent("BACK")
                }
                false
            }
            else -> false
        }
    }

    private fun sendSPenEvent(action: String) {
        try {
            val reactContext = reactInstanceManager?.currentReactContext
            if (reactContext != null) {
                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    ?.emit("SPenAction", action)
            }
        } catch (e: Exception) {
            if (BuildConfig.DEBUG) {
                android.util.Log.w("SPen", "Failed to send S Pen event: $action", e)
            }
        }
    }

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    override fun getMainComponentName(): String = "main"

    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return ReactActivityDelegateWrapper(
            this, BuildConfig.IS_NEW_ARCHITECTURE_ENABLED, DefaultReactActivityDelegate(
                this,
                mainComponentName,  // If you opted-in for the New Architecture, we enable the Fabric Renderer.
                fabricEnabled
            )
        )
    }
}
