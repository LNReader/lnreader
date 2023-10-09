package com.rajarsheechatterjee.EpubParser;

import com.chaquo.python.PyObject;
import com.chaquo.python.Python;
import com.chaquo.python.android.AndroidPlatform;

import android.app.Activity;
import android.content.Intent;
import android.content.Context;
import android.content.ContentResolver;

import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.provider.OpenableColumns;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import java.io.File;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import android.util.Log;

public class EpubParser extends ReactContextBaseJavaModule implements ActivityEventListener{
    private static final int REQUEST_DIRECTORY=100;  //constant request code dunno if will use it
    private static String epubPath;
    private static Promise promise;
    private final EpubParserActivityEventListener activityEventListener;
    private static ReactApplicationContext appContext = null;

    public EpubParser(ReactApplicationContext context){
        super(context);
        appContext = context;
        activityEventListener = new EpubParserActivityEventListener(context, this);
        context.addActivityEventListener(activityEventListener);
        if (!Python.isStarted()) {
            // Initialize Python with the Chaquopy SDK
            Python.start(new AndroidPlatform(context));
        }
    }
    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        if (activity != null && requestCode == REQUEST_DIRECTORY && resultCode == Activity.RESULT_OK) {
            Uri uri = data.getData();
            String epubPath = getFilePathFromUri(uri);

            Python py = Python.getInstance();
            PyObject epubParser = py.getModule("epubParser");

            if (epubPath != null && epubPath.toLowerCase().endsWith(".epub")) {
                PyObject savePath = epubParser.callAttr("parseEpub", epubPath, "/data/data/com.rajarsheechatterjee.LNReader/files/");
                promise.resolve(savePath.toString());
            }
        }
    }

    @Override
    public String getName(){
        return "EpubParser";
    }

    @ReactMethod
    public void openDirectory(Promise promise){
        this.promise = promise;
        try{
            Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.setType("*/*"); //there's an extra backslash in there
            final Activity activity = getCurrentActivity();
            activity.startActivityForResult(intent,REQUEST_DIRECTORY);
        } catch (Exception e){
            promise.reject(e);
        }
    }

    private String getFilePathFromUri(Uri uri){
        String filePath=null;
        if(uri!=null){
            ContentResolver resolver = getCurrentActivity().getContentResolver();
            Cursor cursor=resolver.query(uri,null,null,null,null);
            if(cursor!=null&&cursor.moveToFirst()){
                int index=cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                String fileName=cursor.getString(index);
                cursor.close();

                File file=new File(getReactApplicationContext().getCacheDir(),fileName);
                filePath=file.getAbsolutePath();

                try{
                    InputStream inputStream=resolver.openInputStream(uri);
                    OutputStream outputStream=new FileOutputStream(file);
                    byte[]buffer=new byte[4096];
                    int bytesRead;
                    while((bytesRead=inputStream.read(buffer))!=-1){
                        outputStream.write(buffer,0,bytesRead);
                    }
                    outputStream.close();
                    inputStream.close();
                }catch(IOException e){
                    e.printStackTrace();
                }
            }
        }
        return filePath;
    }
    @Override
    public void onNewIntent(Intent intent) {
        // Handle new intents if needed
    }
}