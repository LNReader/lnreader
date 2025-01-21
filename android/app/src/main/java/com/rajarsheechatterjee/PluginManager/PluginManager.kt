package com.rajarsheechatterjee.PluginManager

import android.annotation.SuppressLint
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.IOException


class PluginManager(context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {
    val plugins: MutableMap<String, PluginContext> = mutableMapOf()

    override fun getName(): String {
        return "PluginManager"
    }

    @SuppressLint("SetJavaScriptEnabled")
    @ReactMethod
    fun createJsContext(html: String, promise: Promise) {
        this.reactApplicationContext.runOnUiQueueThread {
            val view = WebView(this.reactApplicationContext.applicationContext)
            val pluginContext = PluginContext(view)
            view.settings.javaScriptEnabled = true
            view.loadData(html, "text/html; charset=utf-8", "UTF-8")
            view.addJavascriptInterface(object {
                @JavascriptInterface
                fun sendMessage(message: String) {
                    reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        .emit("PluginManager", Arguments.createMap().apply {
                            putString("id", pluginContext.uuid)
                            putString("message", message)
                        })
                }
            }, "PluginManager")
            view.webViewClient = object : WebViewClient() {
                override fun shouldInterceptRequest(
                    view: WebView?,
                    request: WebResourceRequest?
                ): WebResourceResponse? {
                    if (request?.url != null && request.url.path != null
                        && request.url.scheme == "http"
                        && request.url.host == "localhost"
                        && request.url.port == 8081
                        && request.url.path!!.startsWith("/android_asset/")) {
                        val assetPath = request.url.path!!.replace("/android_asset/", "")
                        try {
                            return WebResourceResponse(
                                "application/javascript",
                                "UTF8",
                                reactApplicationContext.assets.open(assetPath)
                            )
                        } catch (e: IOException) {
                            e.printStackTrace() // Failed to load asset file
                        }
                    }
                    return super.shouldInterceptRequest(view, request)
                }
            }
            view.webChromeClient = object : WebChromeClient() {
                override fun onProgressChanged(view: WebView?, newProgress: Int) {
                    super.onProgressChanged(view, newProgress)
                    if (newProgress == 100) {
                        promise.resolve(pluginContext.uuid)
                    }
                }

                override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                    reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        .emit(
                            "NativeDebug",
                            "[PluginManagerWebConsole] ${consoleMessage?.message()}"
                        )
                    return super.onConsoleMessage(consoleMessage)
                }
            }
            plugins[pluginContext.uuid] = pluginContext
        }
    }

    @ReactMethod
    fun eval(id: String, js: String, promise: Promise) {
        this.reactApplicationContext.runOnUiQueueThread {
            plugins[id]?.eval(js, promise)
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
    }

    @ReactMethod
    fun removeListeners(count: Int) {
    }
}