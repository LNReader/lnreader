package com.rajarsheechatterjee.EpubParser;


import android.app.Activity;
import android.content.Intent;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.ReactMethod;

public class EpubParserActivityEventListener extends BaseActivityEventListener {
    private final ReactApplicationContext reactContext;
    private final EpubParser epubParser;

    public EpubParserActivityEventListener(ReactApplicationContext reactContext, EpubParser epubParser) {
        this.reactContext = reactContext;
        this.epubParser = epubParser;
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        epubParser.onActivityResult(activity, requestCode, resultCode, data);
    }
}
