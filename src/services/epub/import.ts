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
import { getString } from '@strings/translations';
import { showToast } from '@utils/showToast';
import TextFile from '@native/TextFile';
import EpubUtil from '@native/EpubUtil';

interface TaskData {
  delay: number;
  sourceUri: string;
}

const insertLocalNovel = (
  name: string,
  path: string,
  cover?: string,
  author?: string,
  artist?: string,
  summary?: string,
): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `
          INSERT INTO 
            Novel(name, path, pluginId, inLibrary, isLocal) 
          VALUES(?, ?, 'local', 1, 1)`,
        [name, path],
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
              id: resultSet.insertId,
              pluginId: LOCAL_PLUGIN_ID,
              author: author,
              artist: artist,
              summary: summary,
              path: NovelDownloadFolder + '/local/' + resultSet.insertId,
              cover: newCoverPath,
              name: name,
              inLibrary: true,
              isLocal: true,
              totalPages: 0,
            });
            resolve(resultSet.insertId);
          } else {
            reject(
              new Error(getString('advancedSettingsScreen.novelInsertFailed')),
            );
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
  path: string,
  releaseTime: string,
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO Chapter(novelId, name, path, releaseTime, position) VALUES(?, ?, ?, ?, ?)',
        [
          novelId,
          name,
          NovelDownloadFolder + '/local/' + novelId + '/' + fakeId,
          releaseTime,
          fakeId,
        ],
        async (txObj, resultSet) => {
          if (resultSet.insertId) {
            let chapterText: string = '';
            try {
              path = decodeURI(path);
            } catch {
              // nothing to do
            }
            await TextFile.readFile(path)
              .then(r => (chapterText = r))
              .catch(e => reject(e));
            if (!chapterText) {
              return;
            }
            const staticPaths: string[] = [];
            const novelDir = NovelDownloadFolder + '/local/' + novelId;
            const epubContentDir = path.replace(/[^\\\/]+$/, '');
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
            await TextFile.writeFile(
              novelDir + '/' + resultSet.insertId + '/index.html',
              chapterText,
            );
            resolve(staticPaths);
          } else {
            reject(
              new Error(
                getString('advancedSettingsScreen.chapterInsertFailed'),
              ),
            );
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

const importEpubAction = async (taskData?: TaskData) => {
  try {
    if (!taskData) {
      throw new Error(getString('backupScreen.noDataProvided'));
    }
    const epubFilePath = RNFS.ExternalCachesDirectoryPath + '/novel.epub';
    await RNFS.copyFile(taskData.sourceUri, epubFilePath);
    const epubDirPath = RNFS.ExternalCachesDirectoryPath + '/epub';
    if (await RNFS.exists(epubDirPath)) {
      await RNFS.unlink(epubDirPath);
    }
    await RNFS.mkdir(epubDirPath);
    MMKVStorage.set(BACKGROUND_ACTION, BackgoundAction.IMPORT_EPUB);
    await ZipArchive.unzip(epubFilePath, epubDirPath);
    await sleep(taskData.delay);

    const novel = await EpubUtil.parseNovelAndChapters(epubDirPath);
    const novelId = await insertLocalNovel(
      novel.name,
      epubDirPath + novel.name, // temporary
      novel.cover,
      novel.author,
      novel.artist,
      novel.summary,
    );
    const now = dayjs().toISOString();
    const filePathSet = new Set<string>();
    if (novel.chapters) {
      BackgroundService.updateNotification({
        taskTitle: getString('advancedSettingsScreen.importNovel'),
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
          chapter.name = chapter.path.split(/[\\\/]/).pop() || 'unknown';
        }
        const filePaths = await insertLocalChapter(
          novelId,
          i,
          chapter.name,
          chapter.path,
          now,
        ).catch(e => {
          throw e;
        });
        filePaths.forEach(filePath => filePathSet.add(filePath));
      }
    }
    await sleep(taskData.delay);
    const novelDir = NovelDownloadFolder + '/local/' + novelId;
    BackgroundService.updateNotification({
      taskTitle: getString('advancedSettingsScreen.importStaticFiles'),
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
        title: getString('advancedSettingsScreen.importEpub'),
        body: getString('common.done'),
      },
      trigger: null,
    });
  } catch (e: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: getString('advancedSettingsScreen.importError'),
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
    const currentAction = MMKVStorage.getString(BACKGROUND_ACTION);
    if (currentAction) {
      throw new Error('Another serivce is running');
    }
    const epubFile = await DocumentPicker.getDocumentAsync({
      type: 'application/epub+zip',
      copyToCacheDirectory: false,
    });
    if (epubFile.canceled) {
      showToast(getString('common.cancel'));
      return;
    }
    await BackgroundService.start<TaskData>(importEpubAction, {
      taskName: 'Import Epub',
      taskTitle: getString('advancedSettingsScreen.parseEpub'),
      taskDesc: getString('common.parsing'),
      taskIcon: { name: 'notification_icon', type: 'drawable' },
      color: '#00adb5',
      parameters: { delay: 500, sourceUri: epubFile.assets[0].uri },
      progressBar: { value: 0, max: 4 },
    });
  } catch (e: any) {
    // BackgroundService.catch cant catch Error from importEpubAction
    // this catch the aboves
    // importEpubAction catches itself
    await Notifications.scheduleNotificationAsync({
      content: {
        title: getString('advancedSettingsScreen.importError'),
        body: e.message,
      },
      trigger: null,
    });
    await BackgroundService.stop();
  }
};
