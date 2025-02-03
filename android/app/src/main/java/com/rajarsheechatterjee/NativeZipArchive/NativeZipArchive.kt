package com.rajarsheechatterjee.NativeZipArchive

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.lnreader.spec.NativeZipArchiveSpec
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.zip.ZipEntry
import java.util.zip.ZipFile
import java.util.zip.ZipInputStream
import java.util.zip.ZipOutputStream

class NativeZipArchive(context: ReactApplicationContext) : NativeZipArchiveSpec(context) {
    @ReactMethod
    override fun unzip(sourceFilePath: String, distDirPath: String, promise: Promise) {
        Thread {
            try {
                ZipFile(sourceFilePath).use { zis ->
                    zis.entries().asSequence().filterNot { it.isDirectory }.forEach { zipEntry ->
                        val newFile = File(distDirPath, zipEntry.name)
                        newFile.parentFile?.mkdirs()
                        zis.getInputStream(zipEntry).use { inputStream ->
                            FileOutputStream(newFile).use { fos -> inputStream.copyTo(fos, 4096) }
                        }
                        Thread.yield()
                    }
                }
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }.start()
    }

    @ReactMethod
    override fun remoteUnzip(
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
                ZipInputStream(connection.inputStream).use { zis ->
                    generateSequence { zis.nextEntry }
                        .filterNot { it.isDirectory }
                        .forEach { zipEntry ->
                            val newFile = File(distDirPath, zipEntry.name)
                            newFile.parentFile?.mkdirs()
                            FileOutputStream(newFile).use { fos -> zis.copyTo(fos, 4096) }
                            Thread.yield()
                        }
                }
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
        sourceDir.walkBottomUp().filter { it.isFile }.forEach { file ->
            val zipFileName =
                file.absolutePath.removePrefix(sourceDir.absolutePath).removePrefix("/")
            val entry = ZipEntry("$zipFileName${(if (file.isDirectory) "/" else "")}")
            zos.putNextEntry(entry)
            file.inputStream().use { fis ->
                fis.copyTo(zos, 4096)
                fis.close()
            }
            Thread.yield()
        }
    }

    @ReactMethod
    override fun remoteZip(
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
