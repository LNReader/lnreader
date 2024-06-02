package com.rajarsheechatterjee.FileManager;

import android.net.Uri;
import android.os.Environment;
import android.provider.DocumentsContract;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;

public class FileManager extends ReactContextBaseJavaModule {
    FileManager(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "FileManager";
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

    @ReactMethod
    public void resolveExternalContentUri(String uriString, Promise promise){
        Uri uri = Uri.parse(uriString);
        try{
            final String docId = DocumentsContract.getTreeDocumentId(uri);
            final String[] split = docId.split(":");
            if("primary".equals(split[0])){
                promise.resolve(Environment.getExternalStorageDirectory() + "/" + split[1]);
            }else{
                promise.resolve(null);
            }
        }catch (Exception e){
            promise.resolve(null);
        }
    }
}