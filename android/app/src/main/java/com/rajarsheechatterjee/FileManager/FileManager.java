package com.rajarsheechatterjee.FileManager;

import android.annotation.SuppressLint;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Environment;
import android.provider.DocumentsContract;
import android.util.Base64;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;

public class FileManager extends ReactContextBaseJavaModule {
    FileManager(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "FileManager";
    }

    private Uri getFileUri(String filepath) throws Exception {
        Uri uri = Uri.parse(filepath);
        if (uri.getScheme() == null) {
            // No prefix, assuming that provided path is absolute path to file
            File file = new File(filepath);
            if(file.isDirectory()){
                throw new Exception("Invalid file, folder found!");
            }
            uri = Uri.parse("file://" + filepath);
        }
        return uri;
    }

    private InputStream getInputStream(String filepath) throws Exception {
        Uri uri = getFileUri(filepath);
        InputStream stream;
        stream = getReactApplicationContext().getContentResolver().openInputStream(uri);
        if (stream == null) {
            throw new Exception("ENOENT: could not open an input stream for '" + filepath + "'");
        }
        return stream;
    }

    private String getWriteAccessByAPILevel() {
        return android.os.Build.VERSION.SDK_INT <= android.os.Build.VERSION_CODES.P ? "w" : "rwt";
    }

    private OutputStream getOutputStream(String filepath) throws Exception {
        Uri uri = getFileUri(filepath);
        OutputStream stream;
        stream = getReactApplicationContext().getContentResolver().openOutputStream(uri, getWriteAccessByAPILevel());
        if (stream == null) {
            throw new Exception("ENOENT: could not open an output stream for '" + filepath + "'");
        }
        return stream;
    }

    @ReactMethod
    public void writeFile(String path, String content, String encoding, Promise promise) {
        try {
            if(encoding == null || encoding.equals("utf8")){
                FileWriter fw = new FileWriter(path);
                fw.write(content);
                fw.close();
            }else{
                byte[] bytes = Base64.decode(content, Base64.DEFAULT);
                OutputStream os = getOutputStream(path);
                os.write(bytes);
                os.close();
            }
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void readFile(String path, Promise promise) {
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

    @SuppressLint("StaticFieldLeak")
    @ReactMethod
    public void copyFile(final String filepath, final String destPath, final Promise promise) {
        new CopyFileTask() {
            @Override
            protected void onPostExecute (Exception e) {
                if (e == null) {
                    promise.resolve(null);
                } else {
                    promise.reject(e);
                }
            }
        }.execute(filepath, destPath);
    }

    @SuppressLint("StaticFieldLeak")
    @ReactMethod
    public void moveFile(final String filepath, String destPath, final Promise promise) {
        try {
            final File inFile = new File(filepath);
            if (!inFile.renameTo(new File(destPath))) {
                new CopyFileTask() {
                    @Override
                    protected void onPostExecute (Exception e) {
                        if (e == null) {
                            inFile.delete();
                            promise.resolve(true);
                        } else {
                            promise.reject(e);
                        }
                    }
                }.execute(filepath, destPath);
            } else {
                promise.resolve(true);
            }
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    private class CopyFileTask extends AsyncTask<String, Void, Exception> {
        protected Exception doInBackground(String... paths) {
            try {
                String filepath = paths[0];
                String destPath = paths[1];

                InputStream in = getInputStream(filepath);
                OutputStream out = getOutputStream(destPath);

                byte[] buffer = new byte[1024];
                int length;
                while ((length = in.read(buffer)) > 0) {
                    out.write(buffer, 0, length);
                    Thread.yield();
                }
                in.close();
                out.close();
                return null;
            } catch (Exception ex) {
                return ex;
            }
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

    @ReactMethod
    public void exists(String filepath, Promise promise) {
        try {
            File file = new File(filepath);
            promise.resolve(file.exists());
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void mkdir(String filepath, Promise promise) {
        try {
            File file = new File(filepath);
            boolean created = file.mkdirs();
            if (!created) throw new Exception("Directory could not be created");
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    private void deleteRecursive(File fileOrDirectory) {
        if (fileOrDirectory.isDirectory()) {
            for (File child : fileOrDirectory.listFiles()) {
                deleteRecursive(child);
            }
        }
        fileOrDirectory.delete();
    }
    @ReactMethod
    public void unlink(String filepath, Promise promise) {
        try {
            File file = new File(filepath);

            if (!file.exists()) throw new Exception("File does not exist");

            deleteRecursive(file);

            promise.resolve(null);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void readDir(String directory, Promise promise){
        try {
            File file = new File(directory);
            if (!file.exists()) throw new Exception("Folder does not exist");
            File[] files = file.listFiles();
            WritableArray fileMaps = new WritableNativeArray();

            for (File childFile : files) {
                WritableMap fileMap = new WritableNativeMap();

                fileMap.putString("name", childFile.getName());
                fileMap.putString("path", childFile.getAbsolutePath());
                fileMap.putBoolean("isDirectory", childFile.isDirectory());
                fileMaps.pushMap(fileMap);
            }
            promise.resolve(fileMaps);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();

        File externalDirectory = this.getReactApplicationContext().getExternalFilesDir(null);
        if (externalDirectory != null) {
            constants.put("ExternalDirectoryPath", externalDirectory.getAbsolutePath());
        } else {
            constants.put("ExternalDirectoryPath", null);
        }

        File externalCachesDirectory = this.getReactApplicationContext().getExternalCacheDir();
        if (externalCachesDirectory != null) {
            constants.put("ExternalCachesDirectoryPath", externalCachesDirectory.getAbsolutePath());
        } else {
            constants.put("ExternalCachesDirectoryPath", null);
        }

        return constants;
    }
}
