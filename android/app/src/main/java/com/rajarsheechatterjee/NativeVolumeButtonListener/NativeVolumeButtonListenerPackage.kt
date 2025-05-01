package com.rajarsheechatterjee.NativeVolumeButtonListener

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.lnreader.spec.NativeVolumeButtonListenerSpec

class NativeVolumeButtonListenerPackage : BaseReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
        if (name == NativeVolumeButtonListenerSpec.NAME) {
            NativeVolumeButtonListener(reactContext)
        } else {
            null
        }

    override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
        mapOf(
            NativeVolumeButtonListenerSpec.NAME to ReactModuleInfo(
                NativeVolumeButtonListenerSpec.NAME,
                NativeVolumeButtonListenerSpec.NAME,
                canOverrideExistingModule = false,
                needsEagerInit = false,
                isCxxModule = false,
                isTurboModule = true
            )
        )
    }
}
