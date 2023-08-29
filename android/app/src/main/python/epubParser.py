import json
import os.path
import os
import re
import zipfile
from lxml import etree
#import shutil
#from PIL import Image #not necessary only for debugging

'''export interface SourceNovel {
  url: string; //must be absoulute
  name: string;
  cover?: string;
  genres?: string;
  summary?: string;
  author?: string;
  artist?: string;
  status?: string;
  chapters?: ChapterItem[];
}
export interface ChapterItem {
  name: string;
  url: string; //must be absoulute
  releaseTime?: string;
}'''

class ChapterItem:
    def __init__(self, name, url, releaseTime):
        self.name = name
        self.url = url
        self.releaseTime = releaseTime #perhaps epub creation date?

namespaces = {
    'calibre':'http://calibre.kovidgoyal.net/2009/metadata',
    'dc':'http://purl.org/dc/elements/1.1/',
    'dcterms':'http://purl.org/dc/terms/',
    'opf':'http://www.idpf.org/2007/opf',
    'ncx':'http://www.daisy.org/z3986/2005/ncx/',
    'u':'urn:oasis:names:tc:opendocument:xmlns:container',
    'xsi':'http://www.w3.org/2001/XMLSchema-instance',
    'xhtml':'http://www.w3.org/1999/xhtml'
}

def getContentOPF(epub_path):
    with zipfile.ZipFile(epub_path) as z:
        text = z.read('META-INF/container.xml') #get container xml to get content
        tree = etree.fromstring(text)
        rootfile_path = tree.xpath('/u:container/u:rootfiles/u:rootfile',
                                   namespaces=namespaces)[0].get('full-path')
        tree = etree.fromstring(z.read(rootfile_path))
    return tree

def cleanTitle(dir_name):
    #cleans a string so that it is valid for directories
    pattern = r'[<>:"/\\|?*\x00-\x1F]'
    # Remove any disallowed characters from the directory name string
    clean_dir_name = re.sub(pattern, '', dir_name)
    return clean_dir_name

def getContent(epub_path, dest_dir):
    extensions = ['.html','.htm','.xhtml','.css','.png','.jpeg','.jpg','.gif','.opf'] # still need the content.opf file
    with zipfile.ZipFile(epub_path) as z:
        for i in range(0,len(z.namelist())):
            if(z.namelist()[i].endswith('opf')):
                contentOPF = z.namelist()[i] #search for opf file
        tree = etree.XML(z.read(contentOPF))
        title = tree.find('.//dc:title', namespaces=namespaces).text
        cleanedTitle = cleanTitle(title)
        dir = dest_dir + 'convertedEpubs/' + cleanedTitle  # temporary directory for saving
        for fileInfo in z.infolist():
            if any(fileInfo.filename.endswith(ext) for ext in extensions):
                z.extract(fileInfo, path = dir)
        return dir

def treeFindsAll(queryString, XMLtree):
    list = XMLtree.findall(queryString, namespaces=namespaces)
    query = ''
    if len(list) == 0:
        query = 'N/A'
        return query
    for item in list:
        query += (item.text + ' ')
    return query

class SourceNovel:
    def __init__(self, url, name, cover, genres, summary, author, artist, chapters):
        self.url = url #file location?
        self.name = name
        self.cover = cover
        self.genres = genres
        self.summary = summary
        self.author = author
        self.artist = artist
        self.status = 'local'
        self.chapters = chapters

def getChapters(z: zipfile.ZipFile, opf_tree):
    isEPUB2 = False
    filename = None
    chapters = []

    for filename in z.namelist():
        if filename.endswith('toc.ncx'):
            isEPUB2 = True
            chpts_data_filename = filename
            break

    if isEPUB2:
        name_by_path = {}
        tree = etree.XML(z.read(chpts_data_filename))
        # lastNavHash = None

        for nav_point in tree.xpath('//ncx:navMap/ncx:navPoint', namespaces=namespaces):
            name = nav_point.find('.//ncx:text', namespaces=namespaces).text
            content = nav_point.find('.//ncx:content', namespaces=namespaces).attrib['src']

            chapter_path = '#' in content and content[:content.index('#')] or content
            # new_chapter_path = chapter_name
            # i = 1

            if name_by_path[chapter_path]: # Chapter has been referenced more than once, split into smaller chapters
                continue
                # new_chapter_path = f'{chapter_path}_lnreaderSplit{i}'
                # lastNavHash = content[content.index('#')+1:]
                # i += 1

            name_by_path[chapter_path] = name
            chapters.append({
                "name":name,
                "path":chapter_path
            })

        # chapters_elements = opf_tree.xpath('//opf:spine//opf:itemref', namespaces=namespaces)
        # for i,chapter_el in enumerate(chapters_elements):
        #     id = chapter_el.get('idref')
        #     item = opf_tree.find(f".//opf:manifest/opf:item[@id='{id}']", namespaces=namespaces)
        #     path = item.attrib['href']
        #     chapter_has_name = path in name_by_path
        #     
        #     if chapter_has_name:
        #         chapter_name = name_by_path[path]
        #         if chapter_name.isnumeric():
        #             chapterName = f"Chapter {chapter_name}"
        #         else:
        #             chapterName = chapter_name
        #     else:
        #         chapterName = f"Unnamed chapter {i+1}"
# 
        #     chapters.append({
        #         "name":chapterName,
        #         "path":path
        #     })
    else:
        # epub 3 uses nav.xhtml instead but I don't have an example rn
        # Temporal workaround, no chapter names included
        chapters_elements = opf_tree.xpath('//opf:spine//opf:itemref', namespaces=namespaces)
        for i,chapter_el in enumerate(chapters_elements):
            id = chapter_el.get('idref')
            item = opf_tree.find(f".//opf:manifest/opf:item[@id='{id}']", namespaces=namespaces)
            path = item.attrib['href']

            chapters.append({
                "name":f"Chapter {i+1}",
                "path":path
            })

    return chapters

def getMetadata(epub_path, save_path):
    with zipfile.ZipFile(epub_path) as z:
        for filename in z.namelist():
            if (filename.endswith('opf')):
                contentOPF = filename  # search for opf file

        tree = etree.XML(z.read(contentOPF))

        title = tree.find('.//dc:title',namespaces=namespaces).text
        print('title', title)

        cover = getCover(epub_path)
        print('cover', cover)

        authors = ''
        for author in tree.findall('.//dc:creator', namespaces=namespaces):
            authors += (author.text + ' ')
        print('authors', authors)

        genre = treeFindsAll('.//dc:subject', tree)
        print('genre', genre)

        summary = treeFindsAll('.//dc:description', tree)
        print('summary', summary)

        artist = '' #this will be included with author as epub files do not need to have an artist role and distinction is probably not necessary
        chapters = getChapters(z, tree)
        print('chapters', chapters)
        
        return {
            'url' : save_path,
            'title' : title,
            'cover' : cover,
            'genre' : genre,
            'summary' : summary,
            'authors' : authors.strip(),
            'artist' : artist,
            'chapters' : chapters,
        }

def getCover(epub_path):
    with zipfile.ZipFile(epub_path) as z:
        for filename in z.namelist():
            if (filename.endswith('opf')):
                contentOPF = filename  # search for opf file

        tree = etree.XML(z.read(contentOPF))
        coverHREF = None

        try:
            coverID = tree.xpath("//opf:metadata/opf:meta[@name='cover']", namespaces=namespaces)[0].get('content')
            print('coverID 2', coverID) #now we know where the cover image is located
            coverHREF = tree.xpath("//opf:manifest/opf:item[@id='"+coverID+"']",namespaces=namespaces)[0].get('href')

        except IndexError: #not an EPUB 2.0
            print('EPUB 2 failure')
            pass

        if not coverHREF: #try EPUB 3.0
            try:
                coverHREF = tree.xpath("//opf:manifest/opf:item[@properties='cover-image']",namespaces=namespaces)[0].get('href')
            except IndexError:
                print('EPUB 3 failure')
                pass
        elif not coverHREF: #some EPUBs don't explicitly declare cover images
            try:
                coverID = tree.xpath("//opf:spine/open:itemref[@idref='cover']",namespaces=namespaces)[0].get('idref')
                temp = tree.xpath("//opf:manifest/opf:item[@id='"+coverID+"']", namespaces=namespaces)[0].get('href')

                tree = etree.fromstring(z.read(temp))
                coverHREF = tree.xpath('//xhtml:img', namespaces=namespaces)[0].get('src')
            except IndexError:
                print('Edge case failure')
        elif not coverHREF:
            print('No cover found')
            return None

        coverPath = coverHREF.replace('\\','/')
        print('coverPath', coverPath)

        return coverPath

def dumpMetaData(metaData, dest_dir):
    dir = dest_dir + 'convertedEpubs/' + cleanTitle(metaData.get('title')) + '/'
    with open(dir + cleanTitle(metaData.get('title')) + '.json', 'w') as fileout:
        json.dump(metaData, fileout)

def parseEpub(epub_path, dest_dir):
    save_path = getContent(epub_path, dest_dir) #simultaneously writes and saves content to a variable
    metaData = getMetadata(epub_path, save_path)
    dumpMetaData(metaData, dest_dir)
    return save_path
