package com.rajarsheechatterjee.EpubParser;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;

public class EpubParser extends ReactContextBaseJavaModule {
    String rootPath;
    String contentDirPath;
    XPath xPath = XPathFactory.newInstance().newXPath();
    DocumentBuilder db = DocumentBuilderFactory.newInstance().newDocumentBuilder();

    EpubParser(ReactApplicationContext context) throws Exception {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "EpubParser";
    }

    @ReactMethod
    public void parse(String epubFilePath, String epubDirPath, Promise promise) {
        try{
            this.rootPath = epubDirPath;
            String novelCover = this.unzip(epubFilePath, epubDirPath);
            File contentFile = this.parseContainer(epubDirPath);
            this.contentDirPath = contentFile.getParent();
            WritableMap novel = (WritableMap) this.parseContent(contentFile);
            if(novelCover != null){
                novel.putString("cover", new File(epubDirPath, novelCover).getAbsolutePath());
            }
            promise.resolve(novel);
        } catch (Exception e) {
            promise.reject(e.getCause());
        }
    }

    public File parseContainer(String epubDir) throws Exception {
        Document doc = this.parserDocument(new File(epubDir, "META-INF/container.xml"));
        return new File(this.rootPath,
                ((Element) doc.getElementsByTagName("rootfile").item(0)).getAttribute("full-path"));
    }

    public ReadableMap parseContent(File contentFile) throws Exception {
        Document content = this.parserDocument(contentFile);
        WritableMap novel = new WritableNativeMap();
        novel.putString("name", this.getFirstElementByTag(content, "dc:title").getTextContent().trim());
        novel.putString("url", contentFile.getParent());
        novel.putString("author", this.getFirstElementByTag(content, "dc:creator").getTextContent().trim());
        novel.putArray("chapters", this.getChapters(content));
        return novel;
    }

    public ReadableArray getChapters(Document doc) throws Exception {
        WritableArray chapters = new WritableNativeArray();
        Document toc = null;
        if (this.getFirstElementByTag(doc, "spine").getAttribute("toc") != null) {
            toc = this.parserDocument(new File(this.contentDirPath, "toc.ncx"));
        }
        NodeList itemrefs = this.getNodeListByTag(doc, "itemref");
        for (int i = 0; i < itemrefs.getLength(); i++) {
            WritableMap chapter = new WritableNativeMap();
            Element itemref = (Element) itemrefs.item(i);
            chapter.putString("name", itemref.getAttribute("idref"));
            Element item = this.getElementById(doc, chapter.getString("name"));
            chapter.putString("url", new File(this.contentDirPath, item.getAttribute("href")).getAbsolutePath());
            if(toc != null){
                chapter.putString("name", this.getChapterName(toc, item.getAttribute(("href"))));
                if(chapter.getString("name") == null) continue;
            }
            chapters.pushMap(chapter);
        }
        return chapters;
    }

    public String getChapterName(Document doc, String href) throws Exception {
        String path = String.format("//*[starts-with(@src,'%1$s')]", href);
        Node node = ((NodeList) this.xPath.compile(path).evaluate(doc, XPathConstants.NODESET)).item(0);
        if(node != null){
            String text = node.getPreviousSibling().getTextContent().trim();
            if(text.isEmpty()) text = node.getPreviousSibling().getPreviousSibling().getTextContent().trim();
            return !text.isEmpty() ? text : null;
        }
        return null;
    }

    public Element getElementById(Document doc, String id) throws Exception {
        return (Element) ((NodeList) this.xPath
                .compile(String.format("//*[@id='%1$s']", id))
                .evaluate(doc, XPathConstants.NODESET))
                .item(0);
    }

    public NodeList getNodeListByTag(Document doc, String tag) throws Exception {
        return (NodeList)
                (
                        this.xPath.compile(String.format("//*[contains(name(), '%1$s')]", tag))
                                .evaluate(doc, XPathConstants.NODESET)
                );
    }

    public Element getFirstElementByTag(Document doc, String tag) throws Exception {
        return (Element) this.getNodeListByTag(doc, tag).item(0);
    }

    public Document parserDocument(File docFile) throws Exception {
        Document doc = this.db.parse(docFile);
        doc.getDocumentElement().normalize();
        return doc;
    }

    public String escapeFilePath(String filePath){
        return filePath.replaceAll(":", "\uA789");
    }

    public String unzip(String epubFilePath, String epubDirPath) throws Exception {
        ZipInputStream zis = new ZipInputStream(new FileInputStream(epubFilePath));
        ZipEntry zipEntry;
        int len;
        String novelCover = null;
        byte[] buffer = new byte[4096];
        while ((zipEntry = zis.getNextEntry()) != null) {
            String escapedFilePath = escapeFilePath(zipEntry.getName());
            if(Pattern.compile(".*cover.*\\.(png|jpeg|jpg)", Pattern.CASE_INSENSITIVE).matcher(escapedFilePath).matches()){
                novelCover = escapedFilePath;
            }
            File newFile = new File(epubDirPath, escapedFilePath);
            if(newFile.exists()) continue;
            newFile.getParentFile().mkdirs();
            FileOutputStream fos = new FileOutputStream(newFile);
            int writeCount = 0;
            while ((len = zis.read(buffer)) > 0) {
                writeCount += 1;
                fos.write(buffer, 0, len);
            }
            fos.close();
            if(writeCount == 0){
                newFile.delete();
            }
        }
        zis.closeEntry();
        zis.close();
        return novelCover;
    }
}
