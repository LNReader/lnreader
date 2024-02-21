package com.rajarsheechatterjee.TextFile;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;

public class TextFile extends ReactContextBaseJavaModule {
    TextFile(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "TextFile";
    }

    @ReactMethod
    public void writeFile(String path, String content, Promise promise) {
        try {
            FileWriter fw = new FileWriter(path);
            fw.write(content);
            fw.close();
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod void readFile(String path, Promise promise) {
        try {
            StringBuilder sb = new StringBuilder();
            BufferedReader br = new BufferedReader(new FileReader(path));
            String line;
            while ((line = br.readLine()) != null) sb.append(line).append('\n');
            promise.resolve(sb.toString());
        } catch (Exception e) {
            promise.reject(e);
        }

    }
}