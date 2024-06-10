package com.rajarsheechatterjee.ZipArchive

import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager

class ZipArchivePackage : ReactPackage {
    override fun createNativeModules(context: ReactApplicationContext): MutableList<NativeModule> =
        listOf(ZipArchive(context)).toMutableList()

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): MutableList<ViewManager<View, ReactShadowNode<*>>> = mutableListOf()
}
