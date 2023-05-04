package com.rajarsheechatterjee.VolumeButtonListener;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
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

    public static void sendEvent(boolean up, int amount) {
        if (active) {
            WritableMap args = Arguments.createMap();
            args.putInt("scrollAmount", amount); // add scroll amount to event data
            if (up)
                appContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("VolumeUp", args);
            else
                appContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("VolumeDown", args);
        }
    }

    public static void down(int amount) {
        sendEvent(false, amount);
    }

    public static void up(int amount) {
        sendEvent(true, amount);
    }

    private static int scrollAmount = 100;

    public static void setScrollAmount(int amount) {
        scrollAmount = amount;
    }

    public static int getScrollAmount() {
        return scrollAmount;
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

    @ReactMethod
    public void setVolumeButtonScrollAmount(int amount) {
        setScrollAmount(amount);
    }

    @ReactMethod
    public void getVolumeButtonScrollAmount(Promise promise) {
        promise.resolve(getScrollAmount());
    }
}