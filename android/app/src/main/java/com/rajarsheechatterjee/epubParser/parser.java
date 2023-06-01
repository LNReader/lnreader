/*
 * Select epub files with this code:
 */
//global variables beneath
/*
private static final int REQUEST_DIRECTORY=100;  //constant request code dunno if will use it
private static String epubPath;

//function to grab file path from Uri
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

//this code goes with the code beneath to parse epub files and create new html files with images and json metadata
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


//Use this code in the onCreate method. It must be called before you run any python code
if (!Python.isStarted()) {
// Initialize Python with the Chaquopy SDK
Python.start(new AndroidPlatform(this));
}

//use this code to open up the file explorer
Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT);
intent.addCategory(Intent.CATEGORY_OPENABLE);
intent.setType("*//*"); //there's an extra backslash in there
startActivityForResult(intent,REQUEST_DIRECTORY);*/