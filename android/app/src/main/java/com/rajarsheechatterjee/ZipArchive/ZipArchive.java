package com.rajarsheechatterjee.ZipArchive;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class ZipArchive extends ReactContextBaseJavaModule {
    ZipArchive(ReactApplicationContext context) throws Exception {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "ZipArchive";
    }
    public String escapeFilePath(String filePath){
        return filePath.replaceAll(":", "\uA789");
    }

    @ReactMethod
    public void unzip(String epubFilePath, String epubDirPath, Promise promise) {
        try{
            ZipInputStream zis = new ZipInputStream(new FileInputStream(epubFilePath));
            ZipEntry zipEntry;
            int len;
            byte[] buffer = new byte[4096];
            while ((zipEntry = zis.getNextEntry()) != null) {
                String escapedFilePath = this.escapeFilePath(zipEntry.getName());
                File newFile = new File(epubDirPath, escapedFilePath);
                newFile.getParentFile().mkdirs();
                FileOutputStream fos = new FileOutputStream(newFile);
                boolean isWritten = false; // ignore folder entry;
                while ((len = zis.read(buffer)) > 0) {
                    isWritten = true;
                    fos.write(buffer, 0, len);
                }
                fos.close();
                if(!isWritten) newFile.delete();
            }
            zis.closeEntry();
            zis.close();
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject(e.getCause());
        }
    }

}
