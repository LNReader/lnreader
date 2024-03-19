package com.rajarsheechatterjee.EpubUtil;

import androidx.annotation.NonNull;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.rajarsheechatterjee.ZipArchive.ZipArchive;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class EpubUtilPackage implements ReactPackage {
    @NonNull
    @Override
    public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactApplicationContext) {
        List<NativeModule> modules = new ArrayList<>();
        try {
            modules.add(new EpubUtil(reactApplicationContext));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return modules;
    }

    @NonNull
    @Override
    public List<ViewManager> createViewManagers(@NonNull ReactApplicationContext reactApplicationContext) {
        return Collections.emptyList();
    }
}
