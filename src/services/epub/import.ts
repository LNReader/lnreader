import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase('lnreader.db');
import * as DocumentPicker from 'expo-document-picker';
import * as RNFS from 'react-native-fs';
import BackgroundService from 'react-native-background-actions';
import * as Notifications from 'expo-notifications';
import { sleep } from '@utils/sleep';
import ZipArchive from '@native/ZipArchive';
import { NovelDownloadFolder } from '@utils/constants/download';
import dayjs from 'dayjs';
import {
  updateNovelCategoryById,
  updateNovelInfo,
} from '@database/queries/NovelQueries';
import { LOCAL_PLUGIN_ID } from '@plugins/pluginManager';
import { MMKVStorage } from '@utils/mmkv/mmkv';
import { BACKGROUND_ACTION, BackgoundAction } from '@services/constants';
import { ChapterItem, SourceNovel } from '@plugins/types';
import { load as parseXML } from 'cheerio';

interface TaskData {
  delay: number;
  sourceUri: string;
}

const insertLocalNovel = (
  name: string,
  url: string,
  cover?: string,
  author?: string,
): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        "INSERT INTO Novel(name, url, cover, author, pluginId, inLibrary, isLocal) VALUES(?, ?, ?, ?, 'local', 1, 1)",
        [name, url, cover || null, author || null],
        async (txObj, resultSet) => {
          if (resultSet.insertId) {
            await updateNovelCategoryById(resultSet.insertId, [2]);
            const novelDir =
              NovelDownloadFolder + '/local/' + resultSet.insertId;
            await RNFS.mkdir(novelDir);
            const newCoverPath =
              'file://' + novelDir + '/' + cover?.split(/[\/\\]/).pop();
            if (cover && (await RNFS.exists(cover))) {
              await RNFS.moveFile(cover, newCoverPath);
            }
            await updateNovelInfo({
              pluginId: LOCAL_PLUGIN_ID,
              id: resultSet.insertId,
              author: author,
              url: NovelDownloadFolder + '/local/' + resultSet.insertId,
              cover: newCoverPath,
              name: name,
              inLibrary: true,
              isLocal: true,
            });
            resolve(resultSet.insertId);
          } else {
            reject(new Error('novel insert failed'));
          }
        },
        (txObj, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

const insertLocalChapter = (
  novelId: number,
  fakeId: number,
  name: string,
  url: string,
  releaseTime: string,
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO Chapter(novelId, name, url, releaseTime) VALUES(?, ?, ?, ?)',
        [
          novelId,
          name,
          // use fakeid just for make the url is unique :D
          NovelDownloadFolder + '/local/' + novelId + '/' + fakeId,
          releaseTime,
        ],
        async (txObj, resultSet) => {
          if (resultSet.insertId) {
            let chapterText = await RNFS.readFile(url);
            const staticPaths: string[] = [];
            const novelDir = NovelDownloadFolder + '/local/' + novelId;
            const epubContentDir = url.replace(/[^\\\/]+$/, '');
            chapterText = chapterText.replace(
              /(href|src)=(["'])(.*?)\2/g,
              ($0, $1, $2, $3: string) => {
                if ($3) {
                  staticPaths.push(epubContentDir + '/' + $3);
                }
                return `${$1}="file://${novelDir}/${$3
                  .split(/[\\\/]/)
                  ?.pop()}"`;
              },
            );
            await RNFS.mkdir(novelDir + '/' + resultSet.insertId);
            await RNFS.writeFile(
              novelDir + '/' + resultSet.insertId + '/index.html',
              chapterText,
            );
            resolve(staticPaths);
          } else {
            reject(new Error('chapter insert failed'));
          }
        },
        (txObj, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

const getParent = (filePath: string) => {
  return filePath.replace(/[/\\][^/\\]+$/, '');
};

const parseNovelAndChapters = async (
  epubDirPath: string,
): Promise<SourceNovel> => {
  const containerText = await RNFS.readFile(
    `${epubDirPath}/META-INF/container.xml`,
  );
  const contentPath =
    epubDirPath + '/' + parseXML(containerText)('rootfile').attr('full-path');
  const contentDir = getParent(contentPath);
  const contentText = await RNFS.readFile(contentPath);
  const parsedContent = parseXML(contentText);
  const novelName = parsedContent('dc\\:title').text().trim();
  const author = parsedContent('dc\\:creator').text().trim();
  const coverRef = parsedContent('meta[name="cover"]').attr('content');
  let cover = '';
  if (coverRef) {
    cover =
      contentDir + '/' + parsedContent(`item[id="${coverRef}"]`).attr('href');
  }
  BackgroundService.updateNotification({
    progressBar: {
      value: 1,
      max: 4,
    },
  });
  const tocPath = contentDir + '/' + 'toc.ncx';
  const tocMap: Record<string, string> = {};
  if (await RNFS.exists(tocPath)) {
    const tocText = await RNFS.readFile(tocPath);
    const toc = parseXML(tocText);
    toc('navPoint').each(function () {
      const href = toc(this).find('content').attr('src');
      const name = toc(this).find('text').text().trim();
      if (href && name) {
        tocMap[href] = name;
      }
    });
  }
  BackgroundService.updateNotification({
    progressBar: {
      value: 2,
      max: 4,
    },
  });
  const itemMap: Record<string, string> = {};
  parsedContent('item').each(function () {
    itemMap[this.attribs.id] = this.attribs.href;
  });
  BackgroundService.updateNotification({
    progressBar: {
      value: 3,
      max: 4,
    },
  });
  const chapters: ChapterItem[] = parsedContent('itemref')
    .toArray()
    .map(ele => {
      const href = itemMap[ele.attribs.idref];
      return {
        name: tocMap[href],
        url: `${contentDir}/${href}`,
      };
    });
  BackgroundService.updateNotification({
    progressBar: {
      value: 4,
      max: 4,
      indeterminate: true,
    },
  });
  const novel: SourceNovel = {
    name: novelName,
    author: author,
    cover: cover,
    url: contentDir + novelName, // temporary
    chapters: chapters,
  };
  return novel;
};

const importEpubAction = async (taskData?: TaskData) => {
  try {
    if (!taskData) {
      throw new Error('No data provided');
    }
    const epubFilePath = RNFS.ExternalCachesDirectoryPath + '/novel.epub';
    await RNFS.copyFile(taskData.sourceUri, epubFilePath);
    const epubDirPath = RNFS.ExternalCachesDirectoryPath + '/epub';
    if (await RNFS.exists(epubDirPath)) {
      await RNFS.unlink(epubDirPath);
    }
    await RNFS.mkdir(epubDirPath).catch(e => {
      throw e;
    });
    MMKVStorage.set(BACKGROUND_ACTION, BackgoundAction.IMPORT_EPUB);
    await ZipArchive.unzip(epubFilePath, epubDirPath).catch(e => {
      throw e;
    });
    await sleep(taskData.delay);
    const novel = await parseNovelAndChapters(epubDirPath).catch(e => {
      throw e;
    });
    const novelId = await insertLocalNovel(
      novel.name,
      novel.url,
      novel.cover,
      novel.author,
    ).catch(e => {
      throw e;
    });
    const now = dayjs().toISOString();
    const filePathSet = new Set<string>();
    if (novel.chapters) {
      BackgroundService.updateNotification({
        taskTitle: 'Import Novel',
        taskDesc: '0/' + novel.chapters.length,
        progressBar: {
          value: 0,
          max: novel.chapters.length,
        },
      });
      for (let i = 0; i < novel.chapters?.length; i++) {
        BackgroundService.updateNotification({
          taskDesc: i + 1 + '/' + novel.chapters.length,
          progressBar: {
            value: i + 1,
            max: novel.chapters.length,
          },
        });
        const chapter = novel.chapters[i];
        if (!chapter.name) {
          chapter.name = chapter.url.split(/[\\\/]/).pop() || 'unknown';
        }
        const filePaths = await insertLocalChapter(
          novelId,
          i,
          chapter.name,
          chapter.url,
          now,
        ).catch(e => {
          throw e;
        });
        filePaths.forEach(filePath => filePathSet.add(filePath));
      }
    }
    await sleep(taskData.delay);
    // move static files
    const novelDir = NovelDownloadFolder + '/local/' + novelId;
    BackgroundService.updateNotification({
      taskTitle: 'Import static files',
      taskDesc: '0/' + filePathSet.size,
      progressBar: {
        value: 0,
        max: filePathSet.size,
      },
    });
    let cnt = 1;
    for (let filePath of filePathSet) {
      BackgroundService.updateNotification({
        taskDesc: cnt + '/' + filePathSet.size,
        progressBar: {
          value: cnt,
          max: filePathSet.size,
        },
      });
      if (await RNFS.exists(filePath)) {
        await RNFS.moveFile(
          filePath,
          novelDir + '/' + filePath.split(/[\\\/]/).pop(),
        );
      }
      cnt += 1;
    }
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'Import Epub',
        body: 'Done',
      },
      trigger: null,
    });
  } catch (e: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Import error',
        body: e.message,
      },
      trigger: null,
    });
  } finally {
    MMKVStorage.delete(BACKGROUND_ACTION);
    await BackgroundService.stop();
  }
};

export const importEpub = async () => {
  try {
    const epubFile = await DocumentPicker.getDocumentAsync({
      type: 'application/epub+zip',
      copyToCacheDirectory: false,
    });
    if (epubFile.type === 'cancel') {
      throw new Error('Cancel');
    }
    await BackgroundService.start<TaskData>(importEpubAction, {
      taskName: 'Import Epub',
      taskTitle: 'Parse Epub',
      taskDesc: 'Parsing',
      taskIcon: { name: 'notification_icon', type: 'drawable' },
      color: '#00adb5',
      parameters: { delay: 500, sourceUri: epubFile.uri },
      progressBar: { value: 0, max: 4 },
    });
  } catch (e: any) {
    // BackgroundService.catch cant catch Error from importEpubAction
    // this catch the aboves
    // importEpubAction catches itself
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Import error',
        body: e.message,
      },
      trigger: null,
    });
    await BackgroundService.stop();
  }
};
