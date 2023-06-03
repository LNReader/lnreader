package com.rajarsheechatterjee.LNReader

import com.chaquo.python.PyObject;
import com.chaquo.python.Python;
import com.chaquo.python.android.AndroidPlatform;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.provider.OpenableColumns;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import java.io.File;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import androidx.appcompat.app.AppCompatActivity;
import android.util.Log;

public class epubParser extends AppCompatActivity{
    private static final int REQUEST_DIRECTORY=100;  //constant request code dunno if will use it
    private static String epubPath;

    private String getFilePathFromUri(Uri uri){
        String filePath=null;
        if(uri!=null){
            ContentResolver resolver=getContentResolver();
            Cursor cursor=resolver.query(uri,null,null,null,null);
            if(cursor!=null&&cursor.moveToFirst()){
                int index=cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                String fileName=cursor.getString(index);
                cursor.close();

                File file=new File(getCacheDir(),fileName);
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
    protected void onActivityResult(int requestCode, int resultCode, Intent data){
        super.onActivityResult(requestCode, resultCode, data);
        if(requestCode == REQUEST_DIRECTORY && resultCode == Activity.RESULT_OK){
            Uri uri = data.getData();
            String folderPath = getFilePathFromUri(uri);
            //Log.d("file name", folderPath);
            epubPath = folderPath;
            //Log.d("epub path", epubPath);
            Python py = Python.getInstance();
            PyObject epubParser = py.getModule("epubParser");
            if(epubPath != null && epubPath.toLowerCase().endsWith(".epub")){
                //Log.d("file name", epubPath);
                PyObject getContent = epubParser.callAttr("parseEpub",epubPath,"/data/data/com.rajarsheechatterjee.LNReader/files/"); //dunno if that's the right app ID
                epubPath = null;
            }
        }
    }
    //trigger this onClick
    protected void onCreate(Bundle savedInstanceState){
        super.onCreate(savedInstanceState);
        if (!Python.isStarted()) {
            // Initialize Python with the Chaquopy SDK
            Python.start(new AndroidPlatform(this));
        }
        Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("*//*"); //there's an extra backslash in there
        startActivityForResult(intent,REQUEST_DIRECTORY);
    }
}