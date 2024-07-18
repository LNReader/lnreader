package com.rajarsheechatterjee.LNReader

import android.app.Application
import android.content.res.Configuration
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader
import com.rajarsheechatterjee.EpubUtil.EpubUtilPackage
import com.rajarsheechatterjee.FileManager.FileManagerPackage
import com.rajarsheechatterjee.VolumeButtonListener.VolumeButtonListenerPackage
import com.rajarsheechatterjee.ZipArchive.ZipArchivePackage
import expo.modules.ApplicationLifecycleDispatcher.onApplicationCreate
import expo.modules.ApplicationLifecycleDispatcher.onConfigurationChanged
import expo.modules.ReactNativeHostWrapper

class MainApplication : Application(), ReactApplication {
    override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
                add(VolumeButtonListenerPackage())
                add(ZipArchivePackage())
                add(FileManagerPackage())
                add(EpubUtilPackage())
            }
 
        override fun getJSMainModuleName(): String = "index"
 
        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
 
        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }



      override val reactHost: ReactHost
      get() = getDefaultReactHost(applicationContext, reactNativeHost)
   
    override fun onCreate() {
      super.onCreate()
      SoLoader.init(this, false)
      if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
        // If you opted-in for the New Architecture, we load the native entry point for this app.
        load()
      }
    }
}
