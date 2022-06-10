package com.rajarsheechatterjee.VolumeButtonListener;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;


public class VolumeButtonListener extends ReactContextBaseJavaModule {

    static ReactApplicationContext appContext;

    public VolumeButtonListener(ReactApplicationContext context) {
        super(context);
        appContext = context;
    }

    private static boolean active = false;

    public static boolean isActive() {
        return active;
    }

    public static boolean prevent = false;

    public static void sendEvent(boolean up) {
        if (active) {
            WritableMap args = Arguments.createMap();
            if (up)
                appContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("VolumeUp", args);
            else
                appContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("VolumeDown", args);
        }
    }

    public static void down() {
        sendEvent(false);
    }

    public static void up() {
        sendEvent(true);
    }

    @ReactMethod
    public void connect() {
        active = true;
    }

    @ReactMethod
    void disconnect() {
        active = false;
    }

    @ReactMethod
    public void pause() {
        active = false;
    }

    @ReactMethod
    public void unpause() {
        active = true;
    }

    @ReactMethod
    public void preventDefault() {
        prevent = true;
    }

    @ReactMethod
    public void noPreventDefault() {
        prevent = false;
    }

    @NonNull
    @Override
    public String getName() {
        return "VolumeButtonListener";
    }

    @ReactMethod
    public void addListener(String eventName) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    public void removeListeners(Integer count) {
        // Keep: Required for RN built in Event Emitter Calls.
    }
}
