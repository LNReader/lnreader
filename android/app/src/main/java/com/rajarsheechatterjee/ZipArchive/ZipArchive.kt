package com.rajarsheechatterjee.ZipArchive

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
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
        return filePath.replace(":", "\uA789")
    }

    private fun unzipProcess(zis: ZipInputStream, distDirPath: String) {
        var zipEntry: ZipEntry?
        var len: Int
        val buffer = ByteArray(4096)
        while (true) {
            zipEntry = zis.nextEntry
            if (zipEntry == null) return
            if (zipEntry.name.endsWith("/")) continue
            val escapedFilePath = escapeFilePath(zipEntry.name)
            val newFile = File(distDirPath, escapedFilePath)
            newFile.parentFile?.mkdirs()
            val fos = FileOutputStream(newFile)
            while (zis.read(buffer).also { len = it } > 0) fos.write(buffer, 0, len)
            fos.close()
        }
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
                promise.reject(e)
            }
        }.start()
    }

    @ReactMethod
    fun remoteUnzip(
        distDirPath: String,
        urlString: String,
        headers: ReadableMap,
        promise: Promise
    ) {
        val connection = URL(urlString).openConnection() as HttpURLConnection
        Thread {
            try {
                connection.requestMethod = "GET"
                val it = headers.entryIterator
                while (it.hasNext()) {
                    val (key, value) = it.next()
                    connection.setRequestProperty(key, value.toString())
                }
                ZipInputStream(connection.inputStream).use { unzipProcess(it, distDirPath) }
                if (connection.responseCode == 200) {
                    promise.resolve(null)
                } else {
                    throw Exception("Network request failed")
                }
            } catch (e: Exception) {
                promise.reject(e)
            } finally {
                connection.disconnect()
            }
        }.start()
    }

    private fun zipProcess(sourceDirPath: String, zos: ZipOutputStream) {
        val sourceDir = File(sourceDirPath)
        sourceDir.walkBottomUp().forEach { file ->
            val zipFileName =
                file.absolutePath.removePrefix(sourceDir.absolutePath).removePrefix("/")
            val entry = ZipEntry("$zipFileName${(if (file.isDirectory) "/" else "")}")
            zos.putNextEntry(entry)
            if (file.isFile) {
                file.inputStream().use { fis -> fis.copyTo(zos) }
            }
        }
    }

    @ReactMethod
    fun remoteZip(
        sourceDirPath: String,
        urlString: String,
        headers: ReadableMap,
        promise: Promise
    ) {
        Thread {
            val connection = URL(urlString).openConnection() as HttpURLConnection
            try {
                connection.requestMethod = "POST"
                val it = headers.entryIterator
                while (it.hasNext()) {
                    val (key, value) = it.next()
                    connection.setRequestProperty(key, value.toString())
                }
                ZipOutputStream(connection.outputStream).use { zipProcess(sourceDirPath, it) }
                if (connection.responseCode == 200) {
                    promise.resolve(
                        connection.inputStream.bufferedReader().use { it.readText() })
                } else {
                    throw Exception("Network request failed")
                }
            } catch (e: Exception) {
                promise.reject(e)
            } finally {
                connection.disconnect()
            }
        }.start()
    }
}
