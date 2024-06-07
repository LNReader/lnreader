package com.rajarsheechatterjee.FileManager

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.DocumentsContract
import android.util.Base64
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch
import java.io.BufferedReader
import java.io.File
import java.io.FileReader
import java.io.FileWriter
import java.io.InputStream
import java.io.OutputStream

class FileManager(context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {
    override fun getName(): String {
        return "FileManager"
    }

    private var _promise: Promise? = null
    private val coroutineScope = MainScope()
    private val activityEventListener = object : BaseActivityEventListener() {
        override fun onActivityResult(
            activity: Activity?,
            requestCode: Int,
            resultCode: Int,
            intent: Intent?
        ) {
            if (requestCode == FOLDER_PICKER_REQUEST) {
                when (resultCode) {
                    Activity.RESULT_CANCELED -> resolveUri()
                    Activity.RESULT_OK -> {
                        if (intent != null) {
                            intent.data?.let { uri ->
                                val flags =
                                    Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                                context.contentResolver.takePersistableUriPermission(uri, flags)
                                resolveUri(uri)
                            }
                        }
                    }
                }
            }
        }
    }

    init {
        context.addActivityEventListener(activityEventListener)
    }

    private fun getFileUri(filepath: String): Uri {
        var uri = Uri.parse(filepath)
        if (uri.scheme == null) {
            // No prefix, assuming that provided path is absolute path to file
            val file = File(filepath)
            if (file.isDirectory) {
                throw Exception("Invalid file, folder found!")
            }
            uri = Uri.parse("file://$filepath")
        }
        return uri
    }

    private fun getInputStream(filepath: String): InputStream {
        val uri = getFileUri(filepath)
        return reactApplicationContext.contentResolver.openInputStream(uri)
            ?: throw Exception("ENOENT: could not open an input stream for '$filepath'")
    }

    private val writeAccessByAPILevel: String
        get() = if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.P) "w" else "rwt"

    private fun getOutputStream(filepath: String): OutputStream {
        val uri = getFileUri(filepath)
        return reactApplicationContext.contentResolver.openOutputStream(uri, writeAccessByAPILevel)
            ?: throw Exception("ENOENT: could not open an output stream for '$filepath'")
    }

    @ReactMethod
    fun writeFile(path: String, content: String, encoding: String?, promise: Promise) {
        try {
            if (encoding == null || encoding == "utf8") {
                val fw = FileWriter(path)
                fw.write(content)
                fw.close()
            } else {
                val bytes = Base64.decode(content, Base64.DEFAULT)
                val os = getOutputStream(path)
                os.write(bytes)
                os.close()
            }
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    @ReactMethod
    fun readFile(path: String?, promise: Promise) {
        try {
            val sb = StringBuilder()
            val br = BufferedReader(FileReader(path))
            var line: String?
            while (br.readLine().also { line = it } != null) sb.append(line).append('\n')
            promise.resolve(sb.toString())
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    @ReactMethod
    fun copyFile(filepath: String, destPath: String, promise: Promise) {
        try {
            copyFileContent(filepath, destPath, null, promise)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    @ReactMethod
    fun moveFile(filepath: String, destPath: String, promise: Promise) {
        try {
            val inFile = File(filepath)
            copyFileContent(filepath, destPath, { inFile.delete() }, promise)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    private fun copyFileContent(
        filepath: String,
        destPath: String,
        onDone: (() -> Unit)? = null,
        promise: Promise? = null
    ) {
        coroutineScope.launch {
            val inputStream = getInputStream(filepath)
            val outputStream = getOutputStream(destPath)
            val buffer = ByteArray(1024)
            var length: Int
            while (inputStream.read(buffer).also { length = it } > 0) {
                outputStream.write(buffer, 0, length)
                Thread.yield()
            }
            inputStream.close()
            outputStream.close()
            if (onDone != null) {
                onDone()
            }
            promise?.resolve(null)
        }
    }

    @ReactMethod
    fun exists(filepath: String, promise: Promise) {
        try {
            val file = File(filepath)
            promise.resolve(file.exists())
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    @ReactMethod
    fun mkdir(filepath: String, promise: Promise) {
        try {
            val file = File(filepath)
            if(!file.exists()){
                val created = file.mkdirs()
                if (!created) throw Exception("Directory could not be created")
            }
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    private fun deleteRecursive(fileOrDirectory: File) {
        if (fileOrDirectory.isDirectory) {
            for (child in fileOrDirectory.listFiles()!!) {
                deleteRecursive(child)
            }
        }
        fileOrDirectory.delete()
    }

    @ReactMethod
    fun unlink(filepath: String, promise: Promise) {
        try {
            val file = File(filepath)
            if (!file.exists()) throw Exception("File does not exist")
            deleteRecursive(file)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    @ReactMethod
    fun readDir(directory: String, promise: Promise) {
        try {
            val file = File(directory)
            if (!file.exists()) throw Exception("Folder does not exist")
            val files = file.listFiles()
            val fileMaps: WritableArray = WritableNativeArray()
            for (childFile in files!!) {
                val fileMap: WritableMap = WritableNativeMap()
                fileMap.putString("name", childFile.name)
                fileMap.putString("path", childFile.absolutePath)
                fileMap.putBoolean("isDirectory", childFile.isDirectory)
                fileMaps.pushMap(fileMap)
            }
            promise.resolve(fileMaps)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun getConstants(): Map<String, Any> {
        val constants: MutableMap<String, Any> = HashMap()
        val externalDirectory = this.reactApplicationContext.getExternalFilesDir(null)
        if (externalDirectory != null) {
            constants["ExternalDirectoryPath"] = externalDirectory.absolutePath
        }
        val externalCachesDirectory = this.reactApplicationContext.externalCacheDir
        if (externalCachesDirectory != null) {
            constants["ExternalCachesDirectoryPath"] = externalCachesDirectory.absolutePath
        }
        return constants
    }

    private fun resolveUri(uri: Uri? = null) {
        _promise?.let { promise ->
            try {
                if (uri == null) promise.resolve(null)
                else {
                    val docId = DocumentsContract.getTreeDocumentId(uri)
                    val split =
                        docId.split(":".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()
                    promise.resolve(
                        Environment.getExternalStorageDirectory().toString() + "/" + split[1]
                    )
                }
            } catch (e: Exception) {
                promise.reject(e)
            } finally {
                _promise = null
            }
        }
    }

    @ReactMethod
    fun pickFolder(promise: Promise) {
        if (_promise != null) promise.reject(Exception("Can not perform action"))
        _promise = promise
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE)
        currentActivity?.startActivityForResult(intent, FOLDER_PICKER_REQUEST)
    }

    companion object {
        const val FOLDER_PICKER_REQUEST = 1
    }
}
