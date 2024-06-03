package com.rajarsheechatterjee.ZipArchive

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import java.util.zip.ZipOutputStream

class ZipArchive(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
    override fun getName(): String {
        return "ZipArchive"
    }

    private fun escapeFilePath(filePath: String): String {
        return filePath.replace(":".toRegex(), "\uA789")
    }

    @Throws(Exception::class)
    private fun unzipProcess(zis: ZipInputStream, distDirPath: String) {
        var zipEntry: ZipEntry
        var len: Int
        val buffer = ByteArray(4096)
        while (zis.nextEntry.also { zipEntry = it } != null) {
            if (zipEntry.name.endsWith("/")) continue
            val escapedFilePath = escapeFilePath(zipEntry.name)
            val newFile = File(distDirPath, escapedFilePath)
            newFile.parentFile?.mkdirs()
            val fos = FileOutputStream(newFile)
            while (zis.read(buffer).also { len = it } > 0) fos.write(buffer, 0, len)
            fos.close()
        }
        zis.closeEntry()
    }

    @ReactMethod
    fun unzip(sourceFilePath: String?, distDirPath: String, promise: Promise) {
        Thread {
            try {
                val zis = ZipInputStream(FileInputStream(sourceFilePath))
                unzipProcess(zis, distDirPath)
                zis.close()
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject(e.cause)
            }
        }.start()
    }

    @ReactMethod
    fun remoteUnzip(distDirPath: String, _url: String?, headers: ReadableMap?, promise: Promise) {
        Thread {
            try {
                val url = URL(_url)
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "GET"
                if (headers != null) {
                    val it = headers.entryIterator
                    while (it.hasNext()) {
                        val (key, value) = it.next()
                        connection.setRequestProperty(key, value.toString())
                    }
                }
                val zis = ZipInputStream(connection.inputStream)
                unzipProcess(zis, distDirPath)
                connection.disconnect()
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject(e.cause)
            }
        }.start()
    }

    private fun walkDir(path: String): ArrayList<String> {
        val res = ArrayList<String>()
        val node = File(path)
        if (node.isFile) {
            res.add(path)
        } else {
            val children = node.list()
            if (children != null) {
                for (filename in children) {
                    val childPaths = walkDir(File(path, filename).toString())
                    res.addAll(childPaths)
                }
            }
        }
        return res
    }

    @Throws(Exception::class)
    private fun zipProcess(sourceDirPath: String, zos: ZipOutputStream) {
        val paths = walkDir(sourceDirPath)
        val buffer = ByteArray(4096)
        var len: Int
        for (path in paths) {
            val zipEntry = ZipEntry(path.replace("$sourceDirPath/", ""))
            zos.putNextEntry(zipEntry)
            FileInputStream(path).use { fis ->
                while (fis.read(buffer).also { len = it } > 0) {
                    zos.write(buffer, 0, len)
                }
            }
            zos.closeEntry()
        }
        zos.close()
    }

    @ReactMethod
    fun remoteZip(sourceDirPath: String, _url: String?, headers: ReadableMap?, promise: Promise) {
        Thread {
            try {
                val url = URL(_url)
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                if (headers != null) {
                    val it = headers.entryIterator
                    while (it.hasNext()) {
                        val (key, value) = it.next()
                        connection.setRequestProperty(key, value.toString())
                    }
                }
                val zos = ZipOutputStream(connection.outputStream)
                zipProcess(sourceDirPath, zos)
                if (connection.responseCode == 200) {
                    val `is` = connection.inputStream
                    val result = ByteArrayOutputStream()
                    val buffer = ByteArray(1024)
                    var length: Int
                    while (`is`.read(buffer).also { length = it } != -1) {
                        result.write(buffer, 0, length)
                    }
                    `is`.close()
                    connection.disconnect()
                    promise.resolve(result.toString())
                } else {
                    throw Exception("Network request failed")
                }
            } catch (e: Exception) {
                promise.reject(e.cause)
            }
        }.start()
    }
}
